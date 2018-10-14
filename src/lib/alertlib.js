const $ = require("jquery");
const layer = require("layui-layer");
const exp ={};

function user_err(info){
    layer.msg('灵活运用offset', {
        offset: 't',
        anim: 1
    });
}

function unexpected_err(info){
    layer.alert(info, {icon: 2});
}

exp.user_err = user_err;
exp.unexpected_err = unexpected_err;

module.exports = exp;