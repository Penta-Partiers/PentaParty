import { useEffect, useRef } from 'react';

// Referenced the following for how to set intervals in React:
// https://itnext.io/how-to-work-with-intervals-in-react-hooks-f29892d650f2
export function useInterval(callback, delay) {
    const callbackRef = useRef();

    useEffect( ()=> {
        callbackRef.current = callback;
    }, [callback]);

    useEffect( ()=> {
        // Game has ended or hasn't been started yet
        if (delay == null) return;

        const interval = setInterval(()=> callbackRef.current(), delay);
        return ()=> clearInterval(interval);
    }, [delay]);
}