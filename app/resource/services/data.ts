export const data = {
    "root": [
        {
            "key": "0-0-0",
            "data": {
                "name": "Admin",
                "type": "Modules"
            },
            "children": [
                {
                    "key": "0-0-0-0",
                    "data": {
                        "name": "Manage Users",
                        "type": "Permission"
                    }
                },
                {
                    "key": "0-0-0-1",
                    "data": {
                        "name": "Manage Roles",
                        "type": "Permission"
                    }
                }
            ]
        },
        {
            "key": "0-0-1",
            "data": {
                "name": "User",
                "type": "Modules"
            },
            "children": [
                {
                    "key": "0-0-1-0",
                    "data": {
                        "name": "Create User",
                        "type": "Permission"
                    }
                },
                {
                    "key": "0-0-1-1",
                    "data": {
                        "name": "Edit User",
                        "type": "Permission"
                    }
                },
                {
                    "key": "0-0-1-2",
                    "data": {
                        "name": "Delete User",
                        "type": "Permission",
                        "code": "user:delete"
                    }
                }
            ]
        }
    ]
};
