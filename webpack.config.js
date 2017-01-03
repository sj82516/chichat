const debug = process.env.NODE_ENV !== "production";
const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');


module.exports = {
    context: path.join(__dirname, "src"),
    devtool: debug ? "inline-sourcemap" : null,
    entry: ['babel-polyfill', "./app.jsx"],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
                }
            },
            {
                test: /\.s?css$/,
                loaders: ["style-loader", "css-loader", 'postcss-loader', "sass-loader"]
            }
        ]
    },
    postcss: [autoprefixer({browsers: ['last 2 versions']})],
    resolve: {
        alias: {
            mydir: path.resolve(__dirname, 'src')
        },
        extensions: ['.jsx', '.js', '', '.scss']
    },
    output: {
        path: __dirname + "/dist/",
        filename: "bundle.min.js"
    },
    plugins: debug ? [] : [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({mangle: false, sourcemap: false}),
        //production 需要加上去，React最自動屏蔽錯誤訊息與優化
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ],
    devServer: {
        proxy: {
            '/**': {  //catch all requests
                target: '/index.html',  //default target
                secure: false,
                bypass: function (req, res, opt) {
                    //your custom code to check for any exceptions
                    //console.log('bypass check', {req: req, res:res, opt: opt});
                    if (req.path.indexOf('/img/') !== -1 || req.path.indexOf('/public/') !== -1) {
                        return '/'
                    }

                    if (req.headers.accept.indexOf('html') !== -1) {
                        return '/index.html';
                    }
                }
            }
        }
    }
};