# ECOPlugs

Communicate with ECOPlugs/Wion Woods WiFi-connected outlets. Read the state of any plug(s) and turn them on/off.

# Installation

    npm install ecoplugs

# Usage

Reading plug on/off status:
```
var plugs = new EcoPlugGroup(config); // config object described below

plugs.getPowerState(config.plugs[0], (err, state) => {
  if (err) console.log("ERROR: ", err);
  else console.log(state ? "ON" : "OFF");
});
```
Turn plug on or off:
```
var newState = true; // truthy for on, falsey for off

plugs.setPowerState(config.plugs[0], newState, (err) => {
  if (err) console.log(err);
});
```

# Configuration

Example configuation object:

```
{
    "plugs": [
        {
            "name": "EcoPlug1",
            "host": "192.168.0.xxx",
            "id": "ECO-xxxxxxxx"
        },
        {
            "name": "EcoPlug2",
            "host": "192.168.0.yyy",
            "id": "ECO-yyyyyyyy"                        
        }
    ]
}
```

| Fields   | Description | Required |
|----------|--------------------------------------------------------------------|:---:|
| plugs    | Array of ECOPlugs to control                                       | Yes |
|          | *Fields for plugs subsection*                                      |     |
| name     | Descriptive name of the ECOPlug                                    | Yes |
| host     | Hostname or IP of the EcoPlug                                      | Yes |
| port     | Port used by the EcoPlug (defaults to 80)                          | No  |
| id       | The id of the EcoPlug as shown in the ECO app under settings       | Yes |
