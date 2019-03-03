import axios from 'axios';


export const backendNameSearch = axios.create({
    baseURL: 'http://localhost:3001/artist/',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


export const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

