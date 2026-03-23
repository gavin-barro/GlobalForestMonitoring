import { useEffect, useState } from "react";
import { getAllUsers } from "../services";
import type { UserGet } from "../types";
import "./StaticDeleteUser.css"

export default function StaticDeleteUserPage() {
    const [users, setUsers] = useState<UserGet[]>([]);

    useEffect(() => {
        getAllUsers()
        .then((result) => setUsers(result));
    }, [users]);

    return (
        <div className="page">
            <div className="input-card">
                <h1 className="card-header">Manage Users</h1>
                <div className="users-container">
                {users.map((user) => (
                    <div className="user-entry" key={user.user_id}>
                        <div className="user-account-type">
                            {user.acct_type}
                        </div>
                        <div className="user-personal-details">
                            Username:{user.username}
                            <br />
                            Email: {user.email}
                        </div>
                        <div className="user-date-details">
                            Account created: {user.creation_date},
                            Last Login: {user.last_login || "Never"}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}