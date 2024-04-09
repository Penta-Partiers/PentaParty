/*
AuthContext wraps around the entire application to provide
each page with the authenticated user's data.

References:
    - https://www.youtube.com/watch?v=77pemM2hwbc
    - https://react.dev/learn/passing-data-deeply-with-context
    - https://react.dev/reference/react/useEffect
*/

// React
import { createContext, useState, useEffect } from 'react';

// Firebase
import { auth } from '../firebase';
import { User, getUser } from "../database/models/user";

// Pages
import Loading from '../pages/Loading';
import { Lobby } from '../database/models/lobby';

export const Context = createContext();

/**
 * Use React Context to keep track of global state variables
 * 
 * ==> Functional Requirements: FR1, FR2, FR7, FR8, FR22
 */
export function AuthContext({ children }) {
    const [user, setUser] = useState();
    const [userDb, setUserDb] = useState(() => {
        const u = sessionStorage.getItem("userDb");
        let parsed = JSON.parse(u);
        if (parsed) {
            return User.fromJson(parsed);;
        }
        else {
            return null;
        }
    });
    // Important for when a page is refreshed to make sure
    // that it's loaded first before rendering anything else.
    const [loading, setLoading] = useState(true);
    const [lobby, setLobby] = useState(() => {
        const l = localStorage.getItem("lobby");
        let parsed = JSON.parse(l);
        if (parsed) {
            return Lobby.fromJson(parsed);
        }
        else {
            return null;
        }
    });

    const [isHost, setIsHost] = useState(() => {
        const h = localStorage.getItem("isHost");
        return h;
    })

    useEffect(() => {
        // The onAuthStateChanged() function from Firebase returns an
        // unsubscribe function that stops monitoring the auth state
        // once the user has logged in.
        // Reference: https://blog.stackademic.com/concept-clear-of-onauthstatechanged-e8dddd4ff5c8
        //
        // ==> Functional Requirement: 
        const unsubscribe = auth.onAuthStateChanged(async currentUser => {
            setLoading(false);

            if (currentUser) {
                setUser(currentUser);
                await getUser(currentUser.uid)
                    .then((userDb) => {
                        setUserDb(userDb);
                        localStorage.setItem("userDb", JSON.stringify(userDb));
                    })
                    .catch((e) => console.log(e));
            }
            else {
                setUser(null);
                setUserDb(null);
                localStorage.setItem("userDb", null);
                localStorage.setItem("lobby", null);
                localStorage.setItem("isHost", "false");
            }
        });
        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, [])

    // Saves any changes to user data to localstorage to persist between refreshes
    // ==> Functional Requirements: FR1, FR2
    useEffect(() => {
        localStorage.setItem("userDb", JSON.stringify(userDb));
    }, [userDb]);

    // Saves any changes to lobby data to localstorage to persist between refreshes
    // ==> Functional Requirements: FR8, FR22
    useEffect(() => {
        localStorage.setItem("lobby", JSON.stringify(lobby));
    }, [lobby]);

    // Children pages have access to the user object and a setter
    // function to update the user
    const values = {
        user: user,
        setUser: setUser,
        userDb: userDb,
        setUserDb: setUserDb,
        lobby: lobby,
        setLobby: setLobby,
        isHost: isHost,
        setIsHost: setIsHost,
    }
    
    // Only display the children content once the authentication is done loading,
    // otherwise display a loading screen
    // ==> FR1, FR2
    return <Context.Provider value={values}>
       {loading ? <Loading /> : children}
    </Context.Provider>
}