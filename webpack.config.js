/* Webpack All-in config file */
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var BowerResolvePlugin = require("bower-resolve-webpack-plugin");
var UglifyJsPlugin = require("uglify-js");
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin");
var WebpackChunkHash = require("webpack-chunk-hash");

module.exports = {
		context:__dirname,
    	entry: {
    	bundle: "./app/bundle.js",
    	vendor:"./app/vendor.js",
  	},
    output: {
        path: path.resolve(__dirname, './app/static/'),
		//Setting publicPath to an absolute url (including domain) resulted in urls (and source maps) being generated properly 
		publicPath: "http://localhost:9000/static/", 
        filename: "[name].min.js",
    	chunkFilename: "[name].[chunkhash].js"
    },
	devtool:"source-map", // cheap source map options don't work with the plugin!
    module: {
        loaders: [
            {
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: 'babel-loader?presets[]=env'
			},
			{
                test: /\.css$/,
				// Mozi et CSS mitoh Bundle, ein zoreh beet running Webpack-dev-server
				use: ExtractTextPlugin.extract({ fallback: 'style-loader', loader: 'css-loader?sourceMap' }) // - For Production
				//use:['style-loader','css-loader?sourceMap']
            },
			{
				test: /\.scss$/,
				use: ["style-loader", // creates style nodes from JS strings , 
				       "css-loader", // translates CSS into CommonJS 
						"sass-loader" // compiles Sass to CSS 
				]
			},
			{
                test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
				use: 'base64-inline-loader?limit=1000&name=[name].[ext]'
            },
			{
				test: /\.html$/,
				use: {
						loader: 'html-loader',
						options: {
									minimize: true
								}
					}
			},
			{ test: /bootstrap.+\.(jsx|js)$/, loader: 'imports-loader?jQuery=jquery,$=jquery,this=>window'},
			{ test: /bootstrap.+\.(jsx|js)$/, loader: 'imports-loader?Tether=tether,this=>window'}
        ]
    },
	plugins: [
		
        new ExtractTextPlugin("[name].min.css"), 		// Mozi et CSS mitoh Bundle, ein zoreh beet running Webpack-dev-server
	    //build optimization plugins							  
  	    /*	new webpack.optimize.CommonsChunkPlugin({   //Ose hozaat Chunks mitoh Bundle - wimuwi leProduction 
    		name: "[name]",								//File wemoziim mimeno
    		filename: "[name].min.js",					//File weyozrim
  		}),*/
		new OptimizeCssAssetsPlugin({
				assetNameRegExp: /\.css$/g,
				cssProcessor: require('cssnano'),
				cssProcessorOptions: { 
					discardComments: {removeAll: true }, 
					map: { inline: false } //Enables sourceMaps for minified CSS
				},
				canPrint: true
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			mangle: {
				except: ['$super', '$', 'exports', 'require']
			},
			sourceMap:true
		}),
		new webpack.HotModuleReplacementPlugin(),
    	// enable HMR globally

    	new webpack.NamedModulesPlugin(),
    	// prints more readable module names in the browser console on HMR updates
		new webpack.NoEmitOnErrorsPlugin(),
		new ManifestPlugin() //This will generate a manifest.json file in your root output directory with a mapping of all source file names to their corresponding output file
	],
	resolve: {
		plugins: [new BowerResolvePlugin()],
		modules: [
			'bower_components',
			'node_modules', 
		],
		descriptionFiles: ['bower.json', 'package.json'],
		mainFields: ['main', 'browser'],
		extensions: ['.js', '.scss','.css']
	},
	devServer: {
		contentBase: path.join(__dirname, "app"),
		compress: true,
		port: 9000,
		stats:"minimal",
		hot:true
	},
	node: {
    	fs: 'empty',
    	net: 'empty',
    	tls: 'empty'
	}
}