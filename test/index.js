'use strict';

var mocha = require('mocha');
var should = require('chai').should();
var Hexo = require('hexo');

describe('hexo-generator-category-feed', function() {
    // Start hexo and register the helpers used by hexo.
    var hexo = new Hexo(__dirname, { silent: true });
    var helpers = require('../node_modules/hexo/lib/plugins/helper').bind(hexo);

    helpers(hexo);

    var Post = hexo.model('Post');
    var generator = require('../lib/generator').bind(hexo);

    var locals = {};
    var posts = null;

    hexo.config.feed = {
        format: 'rss2'
    };

    before(function() {
        return Post.insert([
            { title: 'foo 1', source: 'foo1', slug: 'foo1', date: new Date() },
            { title: 'foo 2', source: 'foo2', slug: 'foo2', date: new Date() },
            { title: 'foo 3', source: 'foo3', slug: 'foo3', date: new Date() },
        ]).then(function(data) {
            posts = data;

            return posts[0].setCategories(['javascript']).then(function() {
                return posts[1].setCategories(['web']);
            }).then(function() {
                return posts[2].setCategories(['windows']);
            });
        }).then(function() {
            locals = hexo.locals.toObject();
        });
    });

    beforeEach(function() {
        hexo.config.title = 'Hexo';
    });

    it('generates RSS2 feeds', function() {
        hexo.config.feed = {
            format: 'rss2'
        };

        var result = generator(locals);

        result.length.should.eql(3);

        result[0].path.should.eql("/categories/javascript/rss2.xml");
        result[1].path.should.eql("/categories/web/rss2.xml");
        result[2].path.should.eql("/categories/windows/rss2.xml");
    });

    it('generates Atom feeds', function() {
        hexo.config.feed = {
            format: 'atom'
        };

        var result = generator(locals);

        result.length.should.eql(3);

        result[0].path.should.eql("/categories/javascript/atom.xml");
        result[1].path.should.eql("/categories/web/atom.xml");
        result[2].path.should.eql("/categories/windows/atom.xml");
    });

    it('generates RSS2 feed with proper title', function() {
        hexo.config.feed = { format: 'rss2' };

        generator(locals)[0].data.should.contain('<title>Hexo</title>');

        hexo.config.title = 'Custom title';

        generator(locals)[0].data.should.contain('<title>Custom title</title>');
    });

    it('generates Atom feed with proper title', function() {
        hexo.config.feed = { format: 'atom' };

        generator(locals)[0].data.should.contain('<title>Hexo</title>');

        hexo.config.title = 'Custom title for atom format';

        generator(locals)[0].data.should.contain('<title>Custom title for atom format</title>');
    });

    it('generates Atom feed with some proper attributes', function() {
        var firstCategory = '/categories/javascript/';
        var result = generator(locals);
        var firstData = result[0].data;
        var firstPath = result[0].path;

        firstData.should.contain(`<id>${hexo.config.url}${firstCategory}</id>`);
        firstData.should.contain(`<link href="${hexo.config.url}${firstPath}" rel="self"`);
        firstData.should.contain(`<link href="${hexo.config.url}/"/>`);
    });
});
