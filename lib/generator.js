var path = require('path');
var fs = require('fs');
var nunjucks = require('nunjucks');
var env = new nunjucks.Environment();

nunjucks.configure({
    autoescape: false,
    watch: false
});

env.addFilter('uriencode', function(str) {
    return encodeURI(str);
});

var atomTemplateSource = path.join(__dirname, '../atom.xml');
var atomTemplate = nunjucks.compile(fs.readFileSync(atomTemplateSource, 'utf8'), env);
var rss2TemplateSource = path.join(__dirname, '../rss2.xml');
var rss2Template = nunjucks.compile(fs.readFileSync(rss2TemplateSource, 'utf8'), env);

module.exports = function(locals) {
    var hexo = this;
    var config = this.config;

    return locals.categories.reduce(function(results,category) {
        if(!category.length) return results;

        var category_url = config.root + category.path;
        var feed_url = category_url + (config.feed.format === "rss2" ? "rss2.xml" : "atom.xml");
        var template = config.feed.format === "rss2" ? rss2Template : atomTemplate;

        var posts = category.posts.sort("-date");

        if(config.feed.limit) {
            posts = posts.limit(config.feed.limit);
        }

        var url = config.url;
        if (url[url.length - 1] !== '/') url += '/';

        var xml = template.render({
            config: config,
            posts: posts,
            feed_url: feed_url,
            url: url,
            category_url: category_url
        });

        return results.concat({ data: xml, path: feed_url });
    }, []);
};
