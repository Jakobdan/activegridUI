//Sample for Assignment 3
const express = require("express");

//Import a body parser module to be able to access the request body as json
const bodyParser = require("body-parser");


//Use cors to avoid issues with testing on localhost
const cors = require("cors");

const app = express();



const port = process.env.PORT ||3000;


//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//Set Cors-related headers to prevent blocking of local requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


// Data for preexisting books and genres

let motors = [
  { address: 1, type: "speed", value: 0},
  { address: 2, type: "speed", value: 0},
  { address: 3, type: "speed", value:0},
  { address: 4, type: "speed", value: 0},
];


// GET all motors
app.get("/api/v1/motors", (req, res) => {
  res.json(motors);
});

// GET a specific motor by Address
app.get("/api/v1/motors/:Address", (req, res) => {
  const motorAddress = parseInt(req.params.address);
  const motor = motors.find(motor => motor.address === motorAddress);
  if (!motor) {
    return res.status(404).json({ message: "Motor not found" });
  }
  res.json(motor);
});



app.post("/api/v1/motors", (req, res) => {
  // Ensure address and value are integers
  const address = parseInt(req.body.address);
  const value = parseInt(req.body.value);

  // Check if address and value are valid integers
  if (isNaN(address) || isNaN(value)) {
    return res.status(400).json({ message: "Address and value must be integers" });
  }

  // Check if the address already exists
  if (motors.some(motor => motor.address === address)) {
    return res.status(409).json({ message: `Motor with address ${address}already exists` });
  }

  const newMotor = { ...req.body, address, value };
  
  motors.push(newMotor);
  motors.sort((a, b) => a.address - b.address);
  res.status(201).json(motors);
});

app.post("/api/v1/stop", (req, res) => {

  motors = [
    { address: 1, type: "speed", value: 0},
    { address: 2, type: "speed", value: 0},
    { address: 3, type: "speed", value:0},
    { address: 4, type: "speed", value: 0},
  ];
  res.status(201).json(motors);

});
app.post("/api/v1/restart", (req, res) => {

  motors = [
    { address: 1, type: "pos", value: 0},
    { address: 2, type: "pos", value: 0},
    { address: 3, type: "pos", value:0},
    { address: 4, type: "pos", value: 0},
  ];


  res.status(201).json(motors);

});
app.post("/api/v1/changeAll/:val/:type", (req, res) => {

  motors.forEach(motor => {
    motor.value = parseInt(req.params.val)
    motor.type = req.params.type
  })
  res.status(201).json(motors);

});

// PATCH an existing motor by Address
// PATCH an existing motor by Address
app.patch("/api/v1/motors/:address", (req, res) => {
  const motorAddress = parseInt(req.params.address);

  // Check if the parsed motor address is a valid integer
  if (isNaN(motorAddress)) {
    return res.status(400).json({ message: "Motor address must be an integer" });
  }

  const updatedMotor = req.body;
  
  // Ensure value is an integer
  const value = parseInt(updatedMotor.value);
  
  // Check if value is a valid integer
  if (isNaN(value)) {
    return res.status(400).json({ message: "Value must be an integer" });
  }

  const index = motors.findIndex(motor => motor.address === motorAddress);

  if (index === -1) {
    return res.status(404).json({ message: "Motor not found" });
  }
  
  try {
    // Update the motor object with the new address and value
    motors[index] = { ...motors[index], ...updatedMotor, address: motorAddress, value };
    motors.sort((a, b) => a.address - b.address);
    res.json(motors[index]);
  } catch (error) {
    console.error('Error updating motor:', error);
    res.status(500).json({ message: "Failed to update motor", error: error.message });
  }
});



// DELETE a motor by Address
app.delete("/api/v1/motors/:address", (req, res) => {
  const motorAddress = parseInt(req.params.address);
  const index = motors.findIndex(motor => motor.address === motorAddress);
  if (index === -1) {
    return res.status(404).json({ message: "Motor not found" });
  }
  const deletedMotor = motors.splice(index, 1);
  res.json(deletedMotor);
});




if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port} :)`);
  });
}

module.exports = app; // Export the app
