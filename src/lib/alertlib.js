const layer = require("layui-layer");
const exp ={};

layer.config({
    path: '/node_modules/layui-layer/src/'
});

function user_err(info){
    layer.msg(info, {
        offset: 't',
        anim: 1,
    });
}

function unexpected_err(info){
    layer.alert(info, {icon: 2});
}

exp.user_err = user_err;
exp.unexpected_err = unexpected_err;

module.exports = exp;