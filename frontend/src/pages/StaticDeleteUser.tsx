import { useEffect, useState } from "react";
import { getAllUsers, requestDeleteUser } from "../services";
import type { UserGet } from "../types";
import "./StaticDeleteUser.css"

export default function StaticDeleteUserPage() {
    const [users, setUsers] = useState<UserGet[]>([]);

    useEffect(() => {
        getAllUsers()
        .then((result) => setUsers(result));
    }, []);

    const handleDelete = async (id: number) => {
        const success = await requestDeleteUser(id);

        if (success) {
            setUsers((prev) => prev.filter((user) => user.user_id !== id));
        } else {
            console.log("Failed to delete user with id: " + id);
        }
    };

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
                        <button onClick={() => handleDelete(user.user_id)}>
                            Delete
                        </button>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}