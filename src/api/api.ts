import axios from 'axios'

export async function postImage(data:any,config:any) {
    try {
        const res = axios.post(
            "https://api.escuelajs.co/api/v1/files/upload",
            data,
            config
        );
        return res;
    } catch (error) {
        throw error
    }
}