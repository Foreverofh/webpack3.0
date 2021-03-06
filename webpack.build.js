/**
 * Created by OUFUHUA on 2017/6/15.
 */
var webpack = require('webpack')
var Merge = require('webpack-merge');
var CommonConfig = require('./webpack.common.js');
var CleanWebpackPlugin = require('clean-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin'); // 复制文件,只能在webpack -p才能复制
var config = require('./config/index')
var CompressionWebpackPlugin = require('compression-webpack-plugin')
// 开启多线程打包
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackConfig = function (env) {
    return Merge(CommonConfig, {
        output: {
            publicPath: config.build.routerBaseUrl,    // 打包路径  也是devServer服务器的相对路径
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use:ExtractTextPlugin.extract({
                        fallback:"style-loader",
                        use: ['css-loader', 'postcss-loader']
                    })

                },
                {
                    test: /\.styl/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: ['css-loader', 'postcss-loader', 'stylus-loader']
                    })
                },
            ]
        },

        plugins: [
            new UglifyJSPlugin({
                parallel: true
            }),

            new CleanWebpackPlugin(['dist']),  // 删除dist
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                except: ['$super', '$', 'exports', 'require'], //排除关键字
                beautify: false,
                mangle: {
                    screw_ie8: true,
                    keep_fnames: true
                },
                compress: {
                    screw_ie8: true,
                    drop_debugger: true,
                    drop_console: true
                },
                comments: false
            }),

            new CopyWebpackPlugin([
                {
                    from: __dirname + '/static',
                    to: __dirname + '/dist/static',
                    ignore: ['.*'],
                    force: true, // 覆盖之前的插件
                }
            ]),

            // 文件gzip
            new CompressionWebpackPlugin({
                asset: '[path].gz[query]',
                algorithm: 'gzip',
                test: new RegExp(
                    '\\.(' +
                    config.build.productionGzipExtensions.join('|') +
                    ')$'
                ),
                threshold: 10240,
                minRatio: 0.8
            }),

            // 抽离css
            new ExtractTextPlugin('css/[name].[hash].css'),

            // 公共部分js抽出来
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: function (module) {
                    return module.context && module.context.indexOf('node_modules') !== -1;
                }
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest'
            }),
            //webpack3.0特点 将一些有联系的模块，放到一个闭包函数里面去，通过减少闭包函数数量从而加快JS的执行速度。
            new webpack.optimize.ModuleConcatenationPlugin(),


        ],

        performance: {
            hints: false
        }
    })
}


module.exports = webpackConfig