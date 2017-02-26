var webpack = require('webpack');

module.exports = {
    entry : './js/main.js',

    output : {
        path : './dist',
        filename : 'main.bundle.js'
    },

    module : {
        loaders : [
            { test : /\.css$/, loader : 'style-loader!css-loader' },
            { test : /\.scss$/, loader : 'style-loader!css-loader!sass-loader' },
            { test : /\.(png|jpg)$/, loader : 'url-loader?limit=8192' }
        ]
    }
}
