module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/rpc',
        destination: 'https://speedy-nodes-nyc.moralis.io/e814489705c92e61b62a5fbc/polygon/mumbai',
      }
    ]
  }
}
