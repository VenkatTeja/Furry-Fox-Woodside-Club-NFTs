const axios = require('axios').default;

export default async function handler(req, res) {
    try{
        const data = await axios.post(process.env.NEXT_PUBLIC_RPC , {param: req.body.param})
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        return res.status(error.status || 500).end(error.message)
    }
}
