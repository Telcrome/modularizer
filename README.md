# Routing server for a human/bot communication

## Deployment

```shell
git push heroku main
```

## Communication Protocol

All message follow the format demonstrated
by the interface `IAgentMessage`.

### Example Messages

Sending a message to another agent:

```javascript
{
    "msg_type": "cmd||answer",
    "cmd": "SetText",
    "to": "auto-chrome",
    "data": {
        "selector": "#searchInput",
        "newValue": "Some text"
    }
}
```

### Login Specification

An agent is expected to specify its available commands during login.

```javascript
{
    "Debug": {
        example: {
            "msg_type": "cmd",
            "cmd": "Debug",
            "to": "debugconsole",
            "data": {
                "msg": "This message should be displayed",
            }
        },
        markDownInstruction: "Displays the message to the user."
    }
}
```
