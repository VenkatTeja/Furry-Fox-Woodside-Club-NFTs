module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/rpc',
        destination: process.env.NEXT_PUBLIC_RPC,
      }
    ]
  }
}
