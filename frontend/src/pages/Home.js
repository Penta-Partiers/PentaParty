import { useContext } from "react";
import { Context } from "../auth/AuthContext";

export default function Home() {
    const {user} = useContext(Context);

    return (
        <p>Home page! Hello {user.displayName ? user.displayName : user.email}!</p>
    )
}