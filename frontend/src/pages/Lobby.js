import { useLocation } from 'react-router-dom';

export default function Lobby() {
    const {state} = useLocation();

    return (
        <div>
            Lobby page! You are {state.isHost ? "a host" : "not a host"}
        </div>
    )
}