# ECOPlugs

Communicate with ECOPlugs/Wion Woods WiFi-connected outlets. Read the state of any plug(s) and turn on/off.

# Installation

    npm install ecoplugs

# Configuration

Configuration sample:

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
| plugs    | Subsection to define individual plugs                              | Yes |
|          | *Fields for plugs subsection*                                      | --- |
| name     | Descriptive name of the plug                                       | Yes |
| host     | Hostname or IP of the EcoPlug                                      | Yes |
| port     | Port used by the EcoPlug (defaults to 80)                          | No  |
| id       | The id of the EcoPlug as shown in the ECO app under settings       | Yes |
