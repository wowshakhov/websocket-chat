module.exports = {  
  entry: './client.ts',
  output: {
    filename: 'client.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.scss$/, loaders: ["style", "css", "sass"] }
    ]
  }
}
