// server.js - API Wheelsun Backend COMPLÈTE
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const os = require("os");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ==================== FONCTION POUR OBTENIR L'IP ====================
function getNetworkIP() {
  console.log("🔍 Recherche de l'adresse IP réseau...");
  
  const interfaces = os.networkInterfaces();
  let wifiIP = null;
  let ethernetIP = null;
  let otherIP = null;

  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   📡 ${interfaceName}: ${iface.address}`);
        
        // Priorité: Wi-Fi
        if (interfaceName.includes('Wi-Fi') || interfaceName.includes('WiFi') || interfaceName.includes('WLAN')) {
          wifiIP = iface.address;
        }
        // Ensuite: Ethernet
        else if (interfaceName.includes('Ethernet') && iface.address.startsWith('20.')) {
          ethernetIP = iface.address;
        }
        // Autre IP
        else if (!iface.address.startsWith('169.254')) { // Pas d'APIPA
          otherIP = iface.address;
        }
      }
    }
  }

  // Retourne par ordre de priorité
  if (wifiIP) {
    console.log(`✅ IP WiFi sélectionnée: ${wifiIP}`);
    return wifiIP;
  }
  if (ethernetIP) {
    console.log(`✅ IP Ethernet sélectionnée: ${ethernetIP}`);
    return ethernetIP;
  }
  if (otherIP) {
    console.log(`✅ Autre IP sélectionnée: ${otherIP}`);
    return otherIP;
  }

  console.log("📍 Utilisation de localhost");
  return 'localhost';
}

const SERVER_IP = getNetworkIP();

// ==================== CONFIGURATION MYSQL ====================
console.log("\n🔧 Configuration MySQL:");
console.log("- Host:", process.env.DB_HOST || "localhost");
console.log("- User:", process.env.DB_USER || "root");
console.log("- Database:", process.env.DB_NAME || "wheelsun_db");
console.log("- Port:", process.env.DB_PORT || 3306);

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "wheelsun_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const db = mysql.createPool(dbConfig);

// ==================== TEST CONNEXION MYSQL ====================
let isDbConnected = false;

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERREUR MYSQL:", err.message);
    console.log("⚠️  Mode simulation activé");
    isDbConnected = false;
  } else {
    console.log("✅ MySQL CONNECTÉ !");
    
    connection.query("SELECT DATABASE() as db", (err, result) => {
      if (!err && result[0]) {
        console.log("📊 Base de données:", result[0].db);
      }
    });
    
    connection.query("SHOW TABLES", (err, tables) => {
      if (!err) {
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log("📋 Tables disponibles:", tableNames.join(", "));
      }
    });
    
    isDbConnected = true;
    connection.release();
  }
});

const JWT_SECRET = process.env.JWT_SECRET || "wheelsun_secret_key";

// ==================== ROUTES API ====================

// 1. RACINE - TEST API
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Wheelsun Backend",
    status: "online",
    version: "2.0.0",
    server_ip: SERVER_IP,
    database: isDbConnected ? "✅ MySQL connecté" : "⚠️ Mode simulation",
    endpoints: {
      auth: ["POST /api/register", "POST /api/login"],
      stations: "GET /api/stations",
      bikes: "GET /api/bikes/:stationId"
    }
  });
});

// 2. STATIONS
app.get("/api/stations", (req, res) => {
  console.log("🔍 /api/stations appelé");
  
  if (isDbConnected) {
    db.query(
      "SELECT id, name, latitude, longitude, address, capacity FROM stations",
      (err, results) => {
        if (err) {
          console.error("❌ Erreur stations:", err);
          return sendFallbackStations(res);
        }
        
        console.log(`📍 ${results.length} stations depuis MySQL`);
        res.json(results);
      }
    );
  } else {
    console.log("⚠️  Mode simulation stations");
    sendFallbackStations(res);
  }
});

// 3. VÉLOS PAR STATION
app.get("/api/bikes/:stationId", (req, res) => {
  const stationId = parseInt(req.params.stationId);
  console.log(`🔍 /api/bikes/${stationId} appelé`);
  
  if (isDbConnected) {
    db.query(
      `SELECT b.id, b.name, b.battery_level as battery, b.price_per_hour as price, 
              b.available, s.name as station_name
       FROM bikes b
       JOIN stations s ON b.station_id = s.id
       WHERE b.station_id = ?`,
      [stationId],
      (err, results) => {
        if (err) {
          console.error(`❌ Erreur bikes:`, err.message);
          return sendFallbackBikes(stationId, res);
        }
        
        console.log(`🚲 ${results.length} vélos pour station ${stationId}`);
        res.json(results);
      }
    );
  } else {
    sendFallbackBikes(stationId, res);
  }
});

// 4. INSCRIPTION
app.post("/api/register", async (req, res) => {
  console.log("📝 Register reçu:", req.body);
  
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, mot de passe et nom requis" 
      });
    }

    if (!isDbConnected) {
      const token = jwt.sign(
        { userId: 999, email: email, name: name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      return res.json({
        success: true,
        message: "Mode simulation - Compte créé",
        token,
        user: { id: 999, email, name, phone: phone || null }
      });
    }

    // Vérifier email
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("❌ Erreur vérification email:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur base de données" 
          });
        }

        if (results.length > 0) {
          return res.status(409).json({ 
            success: false, 
            message: "Cet email est déjà utilisé" 
          });
        }

        // Hasher mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer utilisateur
        db.query(
          "INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)",
          [email, hashedPassword, name, phone || null],
          (err, result) => {
            if (err) {
              console.error("❌ Erreur création:", err);
              return res.status(500).json({ 
                success: false, 
                message: "Erreur création compte" 
              });
            }

            // Générer token
            const token = jwt.sign(
              { userId: result.insertId, email: email, name: name },
              JWT_SECRET,
              { expiresIn: "7d" }
            );

            res.json({
              success: true,
              message: "Compte créé avec succès",
              token,
              user: {
                id: result.insertId,
                email,
                name,
                phone: phone || null
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("❌ Erreur inscription:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
});

// 5. CONNEXION
app.post("/api/login", async (req, res) => {
  console.log("🔐 Login reçu:", req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email et mot de passe requis" 
      });
    }

    if (!isDbConnected) {
      const token = jwt.sign(
        { userId: 999, email: email, name: "Utilisateur Test" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      return res.json({
        success: true,
        message: "Mode simulation - Connecté",
        token,
        user: { id: 999, email, name: "Utilisateur Test" }
      });
    }

    db.query(
      "SELECT id, email, password, name, phone FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("❌ Erreur login:", err);
          return res.status(500).json({ 
            success: false, 
            message: "Erreur base de données" 
          });
        }

        if (results.length === 0) {
          return res.status(401).json({ 
            success: false, 
            message: "Email ou mot de passe incorrect" 
          });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          return res.status(401).json({ 
            success: false, 
            message: "Email ou mot de passe incorrect" 
          });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, name: user.name },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          success: true,
          message: "Connexion réussie",
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || null
          }
        });
      }
    );
  } catch (error) {
    console.error("❌ Erreur login:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
});

// 6. PROFIL UTILISATEUR
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide" });
    }

    const userId = user.userId;

    if (!isDbConnected) {
      return res.json({
        id: userId,
        email: user.email,
        name: user.name || "Utilisateur",
        phone: "+212 6 XX XX XX XX"
      });
    }

    db.query(
      "SELECT id, email, name, phone FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: "Utilisateur non trouvé" 
          });
        }
        res.json(results[0]);
      }
    );
  });
});

// ==================== FONCTIONS FALLBACK ====================
function sendFallbackStations(res) {
  const stations = [
    {
      id: 1,
      name: "ST-WS100",
      latitude: 33.5731,
      longitude: -7.5898,
      address: "Centre-ville Casablanca",
      capacity: 20
    },
    {
      id: 2,
      name: "ST-WS200",
      latitude: 33.5790,
      longitude: -7.5990,
      address: "Quartier des affaires",
      capacity: 15
    },
    {
      id: 3,
      name: "ST-WS300",
      latitude: 33.5670,
      longitude: -7.5800,
      address: "Port de Casablanca",
      capacity: 25
    },
    {
      id: 4,
      name: "ST-WS400",
      latitude: 33.5830,
      longitude: -7.5750,
      address: "Nord Casablanca",
      capacity: 18
    },
    {
      id: 5,
      name: "ST-WS500",
      latitude: 33.581571,
      longitude: -7.602317,
      address: "Nouvelle zone Casablanca",
      capacity: 12
    },
    {
      id: 6,
      name: "ST-WS600",
      latitude: 33.601790,
      longitude: -7.584101,
      address: "Quartier résidentiel Nord",
      capacity: 10
    }
  ];
  
  res.json(stations);
}

function sendFallbackBikes(stationId, res) {
  const bikesDatabase = {
    1: [
      { id: 101, name: "V100-01", battery: 100, price: 6.00, available: true, station_name: "ST-WS100" },
      { id: 102, name: "V100-02", battery: 90, price: 6.00, available: true, station_name: "ST-WS100" },
      { id: 103, name: "V100-03", battery: 80, price: 6.00, available: true, station_name: "ST-WS100" }
    ],
    2: [
      { id: 201, name: "V200-01", battery: 100, price: 6.00, available: true, station_name: "ST-WS200" },
      { id: 202, name: "V200-02", battery: 50, price: 6.00, available: true, station_name: "ST-WS200" }
    ],
    3: [
      { id: 301, name: "V300-01", battery: 100, price: 6.00, available: true, station_name: "ST-WS300" },
      { id: 302, name: "V300-02", battery: 60, price: 6.00, available: true, station_name: "ST-WS300" }
    ]
  };
  
  res.json(bikesDatabase[stationId] || []);
}

// ==================== DÉMARRAGE SERVEUR ====================
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur backend démarré`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 Réseau: http://${SERVER_IP}:${PORT}`);
  console.log(`📱 Pour Expo Go: http://${SERVER_IP}:${PORT}`);
  console.log(`📊 MySQL: ${isDbConnected ? '✅ Connecté' : '❌ Non connecté'}`);
  
  console.log(`\n📡 Endpoints disponibles:`);
  console.log(`   http://${SERVER_IP}:${PORT}/`);
  console.log(`   http://${SERVER_IP}:${PORT}/api/register`);
  console.log(`   http://${SERVER_IP}:${PORT}/api/login`);
  console.log(`   http://${SERVER_IP}:${PORT}/api/stations`);
  console.log(`   http://${SERVER_IP}:${PORT}/api/bikes/1`);
});

// Gestion des erreurs
process.on('SIGINT', () => {
  console.log('\n\n👋 Arrêt du serveur...');
  process.exit(0);
});