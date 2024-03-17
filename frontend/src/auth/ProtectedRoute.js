/*
Wrapper for pages that require the user to be logged in.
If the user hasn't logged in yet, redirect them to the log in page.

Reference: https://www.youtube.com/watch?v=77pemM2hwbc
*/

import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { Context } from "./AuthContext";

export function ProtectedRoute({children}){
    const {user} = useContext(Context);

    if(!user){
        return <Navigate to="/login" replace/>
    }else{
        return children;
    }
}