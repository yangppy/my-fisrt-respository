/* 配置 */
// var UC_PATH_ = "/tmooc"; // 用户中心API接口前缀 例如 :http://xxx.com/[包名]
var UC_PATH_ = "http://uc.tmooc.cn"; // 用户中心API接口前缀 例如 :http://xxx.com/[包名]
var TTS_MYTTS_URL = "http://tts.tmooc.cn"; // TTS 线上
//var TTS_MYTTS_URL = "http://test.tmooc.cn/tts/web"; // TTS 测试环境
var www_path ="http://www.tmooc.cn";
//online
var examPATH = 'http://tes.tmooc.cn/exam/examByCourse?'
// exam_test
//var examPATH = 'http://test.tmooc.cn/tes/web/exam/examByCourse?'
//登录成功回调方法 队列；使用方法： window.loginSuccessCallback.add(fn);
window.loginSuccessCallback = $.Callbacks();
//退出成功回调方法 队列；使用方法： window.logoutSuccessCallback.add(fn);
window.logoutSuccessCallback = $.Callbacks();
var pageUrl;
// 全局ajax设置

$.ajaxSetup({
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    },
    xhrFields: {
        withCredentials: true
    },
    cache: false
});

/* 公共方法 */
/* tab标签 demo-test @lianglei */
$.fn.cusTab = function (opt) {
    var tabs_ = this.find('[data-module="tab"]');
    tabs_.on('click', function () {
        if ($(this).hasClass('active')) {
            return false;
        }
        tabs_.removeClass('active');
        $(this).addClass('active');
        var target_ = $('#' + $(this).data('target'));
        target_.addClass('active');
        target_.siblings('.tab-item').removeClass('active');
        if ($.type(opt) == 'object' && $.type(opt.callback) == 'function') {
            opt.callback(tabs_, target_);
        }

    });
};

// 获取指定 cookie
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return '';
    }
}

// 获取hash
function get_hash(strName) {
    var strHref = window.location.hash;
    var intPos = strHref.indexOf('#');
    var strRight = strHref.substr(intPos + 1);
    var arrTmp = strRight.split('&');
    for (var i = 0; i < arrTmp.length; i++) {
        var arrTemp = arrTmp[i].split('=');
        if (arrTemp[0].toUpperCase() == strName.toUpperCase() && arrTemp[1]) {
            if (i === arrTmp.length - 1) {
                var sIndex = arrTemp[1].indexOf('#');
                if (sIndex !== -1) {
                    arrTemp[1] = arrTemp[1].substring(0, sIndex);
                }
            }
            return arrTemp[1];
        }
    }
    return '';
}

// 写入hash
function set_hash(str) {
    if (str && typeof(str) == "string") {
        window.location.hash = '#' + str;
    }
}

/*自定义下拉选*/
function cusmot_select_fun(obj, callback) {
    var cus_sel_box = (typeof(obj) == 'string') ? $('#' + obj) : obj,
        cus_sel_list = cus_sel_box.find('ul.custom_sel_list'),
        cus_sel_val = cus_sel_box.find('input.custom_sel_val'),
        cus_sel_text = cus_sel_box.find('.custom_sel_text');
    cus_sel_val.val('');
    cus_sel_list.on('click.cusselect', 'li.option', function () {
        cus_sel_text.text($(this).text());
        cus_sel_val.val($(this).attr('ord_id'));
        if (callback && typeof(callback) == 'function') {
            callback($(this).attr('ord_id'), cus_sel_box);
        }
    });
    cus_sel_box.on('click', function () {
        if (cus_sel_list.is(':hidden')) {
            $(document).one('mousedown.order', function (e) {
                var sel_cur_box = $(e.target).closest(cus_sel_box);
                if (sel_cur_box.length > 0) {
                    return;
                }
                cus_sel_list.hide();
            });
            cus_sel_list.show();
        } else {
            $(document).off('mousedown.order');
            cus_sel_list.hide();
        }
    });
}

/*关闭弹窗*/
$(document).on('click', '.js-closewin-btn', function () {
    $.colorbox && $.colorbox.close();
});
$("#js_loginout").click(function () {
    logout_fn();
    return false;
});

function logout_fn() { //退出登录
    $.get(UC_PATH_ + '/user/exitLogin', function (res) {
        if (res.code == 1) {
            if (window.IS_UC_PAGE_) { //个人中心退出登录 返回到登录首页
                location.href = UC_PATH_ + '/login/jumpTologin';
                getUserLoginStatus();
            } else {
                getUserLoginStatus(); //更新tobbar状态
                //刷新当前页
                window.location.reload();
                //特色直播课入口隐藏
                $('#specialCourse').hide();
                pageUrl = "";
                window.logoutSuccessCallback.fire(res);
            }
        } else {
            layer.msg(res.msg);
        }
    });
    return false;
}

/*验证类型*/
function checkType(str, type, obj, form) {
    switch (type) {
        case 'required':
            /*必填*/
            return (str != '');
        case 'mail':
            return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(str);
        case 'phone':
            /*手机号验证,支持台湾*/
            return /^((?!1{11})1\d{10}|09\d{8})$/.test(str);
        case 'mail_phone':
            return /^(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*|(?!1{11})1\d{10}|09\d{8})$/.test(str);
        case 'code':
            return (function () {
                var num = obj.attr('cuslength') || 1;
                var str_ = '^[0-9]{' + num + '}$';
                var reg = new RegExp(str_);
                return reg.test(str);
            })();
        case 'code_en':
            return (function () {
                var num = obj.attr('cuslength') || 1;
                var str_ = '^[0-9a-zA-Z]{' + num + '}$';
                var reg = new RegExp(str_);
                return reg.test(str);
            })();
        case 'chinese':
            return /^[\u4E00-\u9FA5]+$/.test(str);
        case 'ch_and_en':
            /*姓名验证*/
            return /^[a-zA-Z\u4E00-\u9FA5]+$/.test(str);
        case 'nickname':
            return (function () {
                var num = obj.attr('cuslength') || '4,12';
                var str_ = '^[[0-9a-zA-Z_\u4E00-\u9FA5]{' + num + '}$';
                var reg = new RegExp(str_);
                return reg.test(str);
            })();
        //return /^[0-9a-zA-Z_\u4E00-\u9FA5]{4,12}$/.test(str);
        case 'qq':
            /*QQ*/
            return /^[0-9]{5,11}$/.test(str);
        case 'pwd':
            return /^[0-9a-zA-Z_]{6,18}$/.test(str);
        case 'equalTo':
            return (function () {
                var tar = obj.attr('equalTo');
                return (str === $.trim(form.find('#' + tar).val()));
            })();
        case 'specialchars':
            return !/[\-\_\,\!\|\~\`\(\)\#\$\%\^\&\*\{\}\:\;\"\<\>\?]/g.test(str);
        default:
            return true;
    }
}

function validateForm(form_id, opt) {
    var form_ = $('#' + form_id);
    if (!form_.length) {
        return false;
    }
    var fnObj = $.extend(true, {
        checkform: function (obj, val, type) {
            if (type == 'select' || type == 'radio_checkbox') {
                obj.off('change.cusrule').on('change.cusrule', function () {
                    fnObj.errtips($(this), $.trim(this.value), $(this).attr('cusrule'));
                });
            } else {
                obj.off('blur.cusrule').on('blur.cusrule', function () {
                    fnObj.errtips($(this), $.trim(this.value), $(this).attr('cusrule'));
                });
            }
            return this.errtips(obj, val, type);
        },
        form: function () {
            var param = true;
            form_.find('input[cusrule], select[cusrule], textarea[cusrule], div[cusrule]').each(function (i, n) {
                var obj = $(n);
                var cur = fnObj.checkform(obj, $.trim(this.value), obj.attr('cusrule'));
                param = (param && cur);
            });
            return param;
        },
        errtips: function (obj, val, type) {
            var res = checkType(val, type, obj, form_);
            !res ? obj.closest('.form-inp-area').addClass('error') : obj.closest('.form-inp-area').removeClass('error');
            return res;
        }
    }, opt);

    return fnObj;
}

/*登录弹框-xxw*/
$('#login_xxw').click(function () {
    if (window.IS_UC_PAGE_) { //用户中心页面登录
        location.href = UC_PATH_ + '/login/jumpTologin';
    } else {
        toLoginWinFn();
    }
    return false;
});

/* 登陆弹窗方法 */
function toLoginWinFn() {
    $.colorbox({
        speed: 0,
        inline: true,
        overlayClose: false,
        close: false,
        href: "#login_boxxxw",
        onOpen: function () {
            $('#js_login_form').find('.error').removeClass('error');
            $('.js-md-180417-login-cj').find('.js-log-type:first').show()
                .siblings('.js-log-type').hide();
            $('#js_account_pm, #js_password, #js_imgcode').val('');
            $('#js_submit_login').data('isclick', false).html('登录');
        }
    });
    refreshValidateImg(); //刷新验证码
}

/*顶部导航下拉菜单-lty*/
$('#js_init_dropmenu').mouseenter(function () {
    $(this).find('.drop-menu-list').removeAttr('style').stop().slideDown(250);
}).mouseleave(function () {
    $(this).find('.drop-menu-list').stop().slideUp(250);
});


$(document).on('click', '.js-close-tousuimg', function () {
    $(this).closest('.img19122231x').hide();
})
/*在线报名 start*/
$(function () {
    /*top滚动*/
    $(window).scroll(function() {
        if($(window).scrollTop() >= 10){
            if ($('#js_comback').is(':hidden')){
                $('#js_comback').fadeIn()
            }
        }else {
            if (!$('#js_comback').is(':hidden')){
                $('#js_comback').fadeOut()
            }
        }

    });
    /*if($('.md2018041201lty').length != 0) {
        js_init_sign();
    }*/
	
    $("#js_sign_up").on('click', function (e) {
        e.preventDefault();
        $.colorbox({
            speed: 0,
            inline: true,
            overlayClose: false,
            close: false,
            href: "#sign_uplty",
            onOpen: function () {
                reset_form();
                /*打开弹框的时候重新刷新图片验证码*/
                refreshValidateImg('js_validate_img_lty');
            },
            onComplete: function () {
                js_init_sign();
            }
        });
    });

    /*重置表单-lty*/
    function reset_form() {
        var obj_ = $("#sign-formlty");
        obj_[0].reset();
        obj_.find('.custom_sel_text').html('请选择');
        obj_.find('.custom_sel_val').val('');
        obj_.find('.form-inp-area').removeClass('error');
    }

    //返回顶部 -lty
    $('#js_comback').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
    });

    /*在线报名-lty*/
    function js_init_sign() {
        if ($("#sign_uplty").data('is_jsinited')) {
            return false;
        }
        $("#sign_uplty").data('is_jsinited', true);

        /*动态统计textarea的字数-lty*/
        function limitLength(obj, num) {
            var val_input = obj.val(),
                val_length = val_input.length;
            $("#js_total_lty").text(num - Number(val_length));
            if (val_length > num) {
                obj.val(val_input.substring(0, num));
                $("#js_total_lty").text('0');
            } else {
                return;
            }
        }

        $("#remark").keyup(function () {
            limitLength($(this), 255);
        });

        /*构造下拉列表-lty*/
        function js_struc_data(d) {
            var html_ = "";
            $.each(d, function (i) {
                html_ += '<li class="option" ord_id="' + d[i].id + '">' + d[i].name + '</li>';
            })
            return html_;
        };

        /*初始化学科下拉项-lty*/
        $.ajax({
            type: "post",
            url: UC_PATH_ + "/tmoocCategory/queryTop",
            dataType: "json",
            data: {},
            success: function (d) {
                if (d.list != "") {
                    $("#js_subject").find('.custom_sel_list').html(js_struc_data(d));
                }
            }
        });
        cusmot_select_fun($("#js_course"), function (id, par_obj) {
            par_obj.find('.custom_sel_val').trigger('blur.cusrule'); //每次选择后重新触发验证
        });
        cusmot_select_fun($("#js_subject"), function (id, par_obj) {
            par_obj.find('.custom_sel_val').trigger('blur.cusrule'); //每次选择后重新触发验证
            $("#js_course").find('.custom_sel_text').html('请选择');
            $("#js_course").find('.custom_sel_val').val('');
            var pid;
            //  获取当前课程的id
            var pid = $("#subject").val();
            $.ajax({
                type: "post",
                url: UC_PATH_ + "/tmoocCategory/query",
                dataType: "json",
                data: {
                    parentId: pid
                },
                success: function (d) {
                    if (d.list != "") {
                        $("#js_course").find('.custom_sel_list').html(js_struc_data(d));
                    }
                }
            });
        });

        /*初始化城市下拉选-lty*/
        $.ajax({
            type: "post",
            url: UC_PATH_ + "/applicationForm/findProvince",
            dataType: "json",
            data: {},
            success: function (d) {
                if (d.list != '') {
                    $("#js_province").find('.custom_sel_list').html(js_struc_data(d.list));
                }
            }

        });
        cusmot_select_fun($("#js_city"), function (id, par_obj) {
            par_obj.find('.custom_sel_val').trigger('blur.cusrule'); //每次选择后重新触发验证
        });
        cusmot_select_fun($("#js_province"), function (id, par_obj) {
            par_obj.find('.custom_sel_val').trigger('blur.cusrule'); //每次选择后重新触发验证
            $("#js_city").find('.custom_sel_text').html('请选择');
            $("#js_city").find('.custom_sel_val').val('');
            // 获取当前选择课程的id
            var pid = $.trim($('#province').val());
            $.ajax({
                type: "post",
                url: UC_PATH_ + "/applicationForm/findCityInProvince",
                dataType: "json",
                data: {
                    provinceId: pid
                },
                success: function (d) {
                    $("#js_city").find('.custom_sel_list').html(js_struc_data(d.list));

                }
            });
        });
        /*点击发送验证码前验证手机号与图片验证码*/
        $("#js_getPhoneCode").click(function () {
            var t_ = $(this);
            var phone_ = $.trim($("#telephone").val());
            var img_code = $.trim($("#js_imgCode_lty").val());
            var v_phone = validateForm('sign-formlty').checkform($("#telephone"), phone_, 'phone');
            var v_img_code = validateForm('sign-formlty').checkform($("#js_imgCode_lty"), img_code, 'code_en');
            if (v_phone && v_img_code) {
                sendValidateCode({
                    obj: t_,
                    url: UC_PATH_ + "/user/sendPhoneCode",
                    data: {
                        phone: phone_,
                        imgCode: img_code
                    }
                });
            }
        });
        /*点击图片和文字重新刷新图片验证码*/
        $('#sign_uplty .js-validate-img-lty').click(function () {
            var $img = $(this).closest('.form-inp-area').find('img');
            refreshValidateImg($img.attr('id'));
        });


        function save() {
            var telephone = $.trim($('#telephone').val());
            var qq = $.trim($('#qq').val());
            var name = $.trim($('#name').val());
            var cityId = $.trim($("#city").val());
            var cityName = $.trim($('#js_city .custom_sel_text').text());
            var categoryId = $.trim($("#course").val());
            var categoryName = $.trim($('#js_course .custom_sel_text').text());
            var remark = $.trim($('#remark').val());
            var imgCode = $.trim($("#js_imgCode_lty").val());
            var phoneCode = $.trim($("#js_phoneCode_lty").val());
            if ($("#sign_up_source").length != 0) {//渠道
                var chanel = $.trim($("#sign_up_source").val());//线下课
            } else {
                var chanel = '10331002';//平台
            }
            var that_ = $("#js_sign_btn");
            that_.prop("disabled", true);
            $.ajax({
                type: "post",
                url: UC_PATH_ + "/applicationForm/save",
                dataType: "json",
                data: {
                    telephone: telephone,
                    qq: qq,
                    name: name,
                    cityId: cityId,
                    cityName: cityName,
                    categoryId: categoryId,
                    categoryName: categoryName,
                    remark: remark,
                    validateCode: phoneCode,
                    imgCode: imgCode,
                    signUpSource: chanel
                },
                success: function (d) {
                    if (d.code == '1') {
                        layer.msg('亲爱的用户，您已经申请成功！');
                        $.colorbox.close();
                    } else if (d.code == '-1') {
                        layer.msg('业务异常');
                    } else {
                        /*重新刷新图片验证码*/
                        refreshValidateImg('js_validate_img_lty');
                        layer.msg(d.msg);
                    }
                    that_.prop("disabled", false);
                },
                error: function () {
                    that_.prop("disabled", false);
                }
            });
        }

        /*在线报名验证-lty*/
        $("#js_sign_btn").click(function () {
            if (validateForm('sign-formlty').form()) {
                save();
            }
            ;
        });
    }

    var domain = window.location.href;
    if (domain == 'http://www.tmooc.cn/') {
        checkUserSpecial();
        MyCourse();
        /*首页消息弹框*/
        var cookiemes = $.cookie('msgk');
        if (!cookiemes) {
            $.get(UC_PATH_ + '/message/getTitles', {start: 1, pageSize: 5}, function (res) {
            if (res.data&&res.data.length > 0) {
                $.cookie('msgk','1');
                var str = '';
                $.each(res.data,function(i,n){
                    //str += '<div class="mes-box190807"><a href="'+UC_PATH_ +'/message/toHave" class="hd"><p class="text-overflow">'+n.title+'</p></a></div>';
                    str += '<div class="mes-box190807"><a href="'+UC_PATH_ +'/message/toHave" class="hd"><p class="text-overflow font-14">'+n.title+'</p><p class="font-12px color-999 p2">'+n.publishDate+'</p></a></div>'
                });
                layer.open({

                    type: 1 //Page层类型
                    ,skin:'bg-title-xw'
                    ,area: ['330px', 'auto']
                    ,title: '消息中心'
                    ,maxmin: false //允许全屏最小化
                    ,anim: 0 //0-6的动画形式，-1不开启
                    ,offset: 'rb'
                    ,shade: 0
                    ,content: '<div style="padding:10px 20px;">'+str+'</div>'
                });
              }
           })
        }
        $('body').append(
        		/*'<div class="hhhhffff text-center">\n' +
                '             <a href="http://www.tmooc.cn/zhuanti.html"><img class="" src="http://cdn.tmooc.cn/tmooc-web/css/img/zhuanti/hengfu190908.png"></a>\n' +
                '            <span class="ccclllbbttn"><img src="http://cdn.tmooc.cn/tmooc-web/css/img/zhuanti/cccllxxx.png"></span>\n' +
                '        </div>'+
                '		<div class="img19122231x">'+
                '			<img class="" src="http://cdn.tmooc.cn/tmooc-web/css/img/imgxxw20200112.png">'+
                '			<span class="js-close-tousuimg"> </span>'+
        		'       </div>'*/);
            $('.ccclllbbttn').click(function(){
                $('.hhhhffff').remove();
            });
            /*首页拉幕*/
       	 if ($.cookie('nnnn')){
       		 $('.md-20190918x .img1111').css({opacity:1,'zIndex':110,position:'relative'});
            }else {
                $('.md-20190918x .img1918-box').slideDown(1000);

            }
            $('.close-btn190918').click(function () {
                var p = $(this).parent();
                var h = $('.md-20190918x .img1111').height();
                $('.md-20190918x .img1111').show();
                p.animate({height:h},600,function () {
                    p.animate({opacity:0})
                    $('.md-20190918x .img1111').css('z-index',110).animate({opacity:1});
                });
                //将拉幕关闭状态存入cookie并设置此cookie的存储时长为1天
                $.cookie('nnnn',1,{expires:1});
                return false;
            })
       	/*首页拉幕*/
    }
    $('body').append('<div id="id0606" style="display:none"></div>')

    /*tts课程跳转*/
    $(document).on('click','.tts-course-state',function(e) {
    	e.preventDefault();
        var $t = $(this);
        var f = $t.data('coursestate');
        var code  = $t.data('code');
        var cn  = $t.data('cn');
        var courseversion = $t.data('courseversion');
        var studentclassroomid = $t.data('studentclassroomid');
        var studymode = $t.data('studymode');
        var jumpStudyMode = '';
        if(studymode =='105100' || studymode == '105101'){
        	jumpStudyMode = studymode;
			
		}
        if (f == '0') {
            $.get(UC_PATH_ + '/userCenter/findValidateMsg?studentOrderCode='+code, function (d) {
                if (d.code == 1) {
                    //$('#s1').text(d.obj.courseName);
                    //$('#s2').text(cn);
                    //$('#phone').val(d.obj.phone);
                    //$("#courseInfoId").data("courseName", d.obj.courseName);
                    //$("#courseInfoId").data("phone", d.obj.phone);
                    //$("#courseInfoId").data("courseCode", code);
                    var courseValidateHtml = '<div>'
                    +'<div id="tk-box1">'
                    +'<div  class="md-2018040401-ll cus-win-model md2018041302lty">'
                    +'<form autocomplete="off">'
                    +'<div class="form-ele-box">'
                    +'<div class="form-item clearfix">'
                    +'<div class="tit" style="font-size: 20px;text-align: center;padding: 0px 0 10px;">达内课程验证</div>'
                    +'</div>'
                    +'<div style="color: #000">所报方向：<span style="margin-right: 15px;" id="s1">'+d.obj.courseName+'</span> 所在班级：<span id="s2">'+cn+'</span></div>'
                    +'<div class="form-item clearfix" style="margin-bottom: 0;"><input  class="form-input pull-right" id="phone" readonly="" value="'+d.obj.phone+'" readonlytype="text" style="width: 100%;"></div>'
                    +'<p  style="color: red;margin-bottom: 15px;font-size:12px">该手机号为您报名时提供，如有问题请联系报名老师修改</p>'
                    +'<div class="form-item clearfix"><input class="form-input pull-left" id="inputCode" value="" type="text" style="width: 200px;">'
                    +'<button class="form-btn form-btn-blue pull-right" type="button" id="sendMessageId" style="width: 130px;" onclick="sendValidCode();">发送验证码</button>'
                    +'<div class="error-lty error-show color-red"><span></span></div>'
                    +'</div>'
                    +'<div class="form-item clearfix">'
                    +'<button class="form-btn form-btn-blue width-100" type="button" id="submitValidId" onclick="submitValidCode(\''+courseversion+'\',\''+jumpStudyMode+'\');">提交验证码</button>'
                    +'</div>'
                    +'</div>'
                    +'<input type="hidden" id="courseInfoId"  data-courseName="'+d.obj.courseName+'" data-phone="'+d.obj.phone+'" data-coursecode="'+code+'"><span class="cus-win-modelclose js-closewin-btn" onclick="closeCancel();"><i class="cusfont cusfont-close font-14"></i></span></form>'
                    +'</div>'
                    +'</div>'
                    +'</div>';
                    $('#id0606').html(courseValidateHtml);
                    $("#courseInfoId").data("courseName", d.obj.courseName);
                    $("#courseInfoId").data("phone", d.obj.phone);
                    $("#courseInfoId").data("courseCode", code);
                    $.colorbox({
                        speed: 0,
                        inline: true,
                        overlayClose: false,
                        close: false,
                        href: "#tk-box1",
                        onClosed:function(){
                            $('#tk-box1 input').val('')
                        }
                    });
                }
            });

            return false;
        } else {
        	checkTtsUser(courseversion,studentclassroomid);
        }
    })

});
// * 判断课程上显示的角标类型
function checkSuperscriptType(n){
    var typeC = ''
    if (n.courseType !== undefined && n.courseType != 1) {
        // * ！=1 的是 tmooc 的
        // * type(10101001：免费,10101002:付费,10101003:vip,10101004:直播,10101005:预习);
        if (n.hasLive == '10121001') {
            // * 这是直播
            typeC = 'live';
        } else {
            switch (n.type) {
                case '10101001': //免费
                    typeC = 'free';
                    break;
                case '10101003': //VIP
                    typeC = 'vip';
                    break;
                default:
                    typeC = '';
            }
        }
        // * 10101005:预习 优先级第一
        if (n.type == '10101005') {
            typeC = 'prepare';
        }
    } else {
        // * ==1 这是 tts
        // * studyMode 105100=脱产；其他=VIP；
        if (n.studyMode == '105101') {
        	typeC = 'tts-vip'
        } else {
        	typeC = 'no-full-time'
        }
    }
    return typeC
}
/**我的课程*/
function MyCourse(){
	/*我的课程栏目*/
    $.get(UC_PATH_ + '/userCenter/findShowUserCourse', function (d) {
        if (d.code == 1) {
            var str = '<div class="md-com-list">\n' +
                '                <div class="md-hd">\n' +
                '                    <div class="pull-left">\n' +
                '                        <i class="cusfont cusfont-video link-color"></i>\n' +
                '                        <span class="hd-tit color-333 font-20 verflag">我的课程</span>\n' +
                '                    </div>\n' +
                '                    <a href="'+UC_PATH_+'/userCenter/toUserSingUpCoursePage" class="font-14 pull-right color-999" target="_blank">查看更多&gt;&gt;</a>\n' +
                '                </div>\n' +
                '                <ul class="md-bd clearfix md-2018040201-lty">';
            if (d.list.length > 0) {
                $.each(d.list, function (i, n) {
                    if (n.courseType != 1) {
                        var text1 = '',
                            cls1 = '', //价格class
                            text2 = '报名'; //报名或购买
                        if (n.hasLive == '10121001') {
                            // * 这是直播
                            switch (n.type) {
                                case '10101001':
                                    cls1 = 'no-money';
                                    text1 = '免费';
                                    break;
                                case '10101003':
                                    cls1 = 'price';
                                    text1 = '￥' + n.price + '（会员免费）';
                                    break;
                                default:
                                    cls1 = 'price';
                                    text1 = '￥' + n.price;
                                    text2 = '购买';
                            }
                        } else {
                            switch (n.type) {
                                case '10101001': //免费
                                    cls1 = 'no-money';
                                    text1 = '免费';
                                    break;
                                case '10101003': //VIP
                                    cls1 = 'price';
                                    text1 = '￥' + n.price + '（会员免费）';
                                    break;
                                default:
                                    cls1 = 'price';
                                    text1 = '￥' + n.price;
                                    text2 = '购买';
                            }
                        }

                        str += '<li class="pic-box pull-left ' + checkSuperscriptType(n) + '">\n' +
                            ' <div class="hd-pic">\n' +
                            '     <a href="' + n.detailsUrl + '" target="_blank">\n' +
                            '     <img src="' + n.urlSmall + '" alt="">\n' +
                            '     <i class="state"></i>\n' +
                            '   </a>\n' +
                            '  </div>\n' +
                            '  <div class="bd-word bgcolor-fff">\n' +
                            '  <h4 class="bd-tit color-333 ">\n' +
                            '    <a href="' + n.detailsUrl + '" class="color-333" target="_blank">' + n.name + '</a>\n' +
                            '  </h4>\n' +
                            '  <div class="clearfix">\n' +
                            '    <span class="' + cls1 + ' pull-left">' + text1 + '</span>\n' +
                            '    <span class="sign-num pull-right color-888">' + n.singUpNum + '人' + text2 + '</span>\n' +
                            '  </div>\n' +
                            ' </div>\n' +
                            '</li>'
                    } else {
                        var str111 =JSON.stringify(n.courseVersion);
                        var courseStateStr = n.courseState;
                        
                        var htmlStr ='';
                        if(courseStateStr == "0"){
                        	htmlStr = '待验证';
                        }else{
                        	htmlStr = '距离有效期截止还剩' + n.surplusDate ;
                        }
                        
                        
                        str += '<li class="pic-box pull-left '+ checkSuperscriptType(n) +'">' +
                            ' <div class="hd-pic">' +
                            '     <a href="###"  class="tts-course-state" data-studymode = "'+n.studyMode+'" data-cn="'+n.className+'" data-code="'+n.studentOrderCode+'" data-studentclassroomid="'+n.studentClassroomId+'" data-courseversion="'+n.courseVersion+'" data-coursestate="'+n.courseState+'"  cusid="'+n.courseVersion +'">'+
                            '     <img src="' + n.urlSmall + '" alt="">' +
                            '     <i class="state"></i>' +
                            '   </a>' +
                            '  </div>' +
                            '  <div class="bd-word bgcolor-fff">' +
                            '  <h4 class="bd-tit color-333 ">' +
                            '   <p title="' + n.courseName + '" class="text-overflow">方向：' + n.courseName + '</p>' +
                            '   <p>班级：' + n.className + '</p>' +
                            '  </h4>' +
                            '  <div class="clearfix">' +
                            htmlStr+
                            '  </div>' +
                            ' </div>' +
                            '</li>'
                    }

                });
            }else {
                str+='<li style="width: 100%"><div class="md-2018042301-xxw text-center">\n' +
                    '                        <div class="icon-box">\n' +
                    '                            <img src="http://cdn.tmooc.cn/tmooc-web/css/img/icon_xxw042301.png">\n' +
                    '                        </div>\n' +
                    '                        <div class="text-box">\n' +
                    '                            <p class="font-14 color-333">同学您好，当前没有正在学习的课程哦！</p>\n' +
                    '                        </div>\n' +
                    '                    </div></li>';
            }

            str += '                </ul>\n' +
                '            </div>';
            $('.md2018040401lty>.container').prepend(str);
        }
    })
}
/*在线报名 end*/

/*获取传参*/
function requestParam(strName) {
    var strHref = location.search;
    var intPos = strHref.indexOf('?');
    if (intPos === -1) {
        return '';
    }
    var strRight = strHref.substr(intPos + 1);
    var arrTmp = strRight.split('&');
    for (var i = 0; i < arrTmp.length; i++) {
        var arrTemp = arrTmp[i].split('=');
        if (arrTemp[0].toUpperCase() == strName.toUpperCase()) {
            if (i === arrTmp.length - 1) {
                var sIndex = arrTemp[1].indexOf('#');
                if (sIndex !== -1) {
                    arrTemp[1] = arrTemp[1].substring(0, sIndex);
                }
            }
            return arrTemp[1];
        }
    }
    return '';
}

/* ccj */

// 图片验证码
function refreshValidateImg(ele) {
    $('#' + (ele || 'js_validate_img')).attr("src", UC_PATH_ + "/validateCode?t=" + Math.random());
}

// 发送短信、邮箱验证码
function sendValidateCode(opt) {
    if ($.type(opt) != 'object' || !opt.obj.length) {
        return false;
    }
    var $obj = opt.obj;
    if (!$obj.data('issend')) {
        var second = opt.time || 59;
        var s_time = setInterval(function () {
            if (second <= 1) {
                $obj.prop('disabled', false).data('issend', false).text(opt.txt || '获取动态码');
                clearInterval(s_time);
                return false;
            } else {
                $obj.text('（' + second-- + 's）');
            }
        }, 1000);

        $.post(opt.url, opt.data, function (res) {
            if (res.code != 1) {
                $obj.prop('disabled', false).data('issend', false).text(opt.txt || '获取动态码');
                clearInterval(s_time);
                layer.msg(res.msg);
            }
            opt.callback && opt.callback(res);
        });
        $obj.prop('disabled', true).data('issend', true);
    }
}

// 初始化登录
function initLoginFn() {
    // refreshValidateImg();

    $('.js-validate-img').click(function () {
        refreshValidateImg();
    });
    // 登录类型切换
    $('.js-md-180417-login-cj').on('click', '.js-log-type-cut', function () {
        var p_ = $(this).closest('.js-log-type');
        p_.hide().siblings('.js-log-type').show();

        var sib_ = p_.siblings('.js-log-type');
        if (sib_.data('logtype') == 3) {
            var state;
            if (window.IS_UC_PAGE_) {
                state = window.IS_UC_PAGE_;
            } else {
                var local = location.href;
                state = encodeURIComponent(encodeURIComponent(local));
            }
            if (window.WxLogin) {
                new WxLogin({
                    self_redirect: false,
                    id: "js_wx_code_log",
                    appid: "wx3478ef3576df5109",
                    scope: "snsapi_login",
                    redirect_uri: encodeURIComponent("http://www.tmooc.cn/touc" + "/login/wxLogin"),
                    state: state,
                    style: "black",
                    href: ""
                });
            } else {
                $('#js_wx_code_log').html('<p style="font-size: 16px; padding-top: 50px;">微信初始化失败，请重试！</p>');
            }

        }
        setTimeout(function () {
            $.colorbox && $.colorbox.resize();
        }, 10);
    });
    // 提交表单-登录
    $(document).on('click','#js_submit_login',function(){
    //$('#js_submit_login').click(function () {
        if (validateForm('js_login_form').form()) {
            var t_ = $(this);

            var loginNmae = $.trim($('#js_account_pm').val());
            var password = $.trim($('#js_password').val());
            var imgcode = $.trim($('#js_imgcode').val());
            var log_type; // 0 手机，1 邮箱

            var flag_ = true;

            // 用户名类型判断
            if (checkType(loginNmae, 'mail')) {
                log_type = 1;
            } else if (checkType(loginNmae, 'phone')) {
                log_type = 0;
            }

            if (!t_.data('isclick')) {
                t_.data('isclick', true).html('登录中...');
                // 登录次数
                $.post(UC_PATH_ + "/login/loginTimes", {
                    loginName: loginNmae,
                    accountType: log_type
                }, function (res) {
                    if (res.code == 1) {
                        if (res.obj >= 3) {
                            if (!$('#js_validate_img_area').is(':visible')) {
                                $('#js_validate_img_area').show().find('#js_imgcode').attr('cusrule', 'code_en').attr('cuslength', 4);
                                $.colorbox.resize();
                                flag_ = false;
                                refreshValidateImg();
                            }
                            t_.data('isclick', false).html('登录');
                        }
                        if (flag_) {
                            // 登录接口
                            $.post(UC_PATH_ + "/login", {
                                loginName: loginNmae,
                                password: MD5(password),
                                imgCode: imgcode,
                                accountType: log_type
                            }, function (res) {
                                // TODO
                                // TTS 用户要有提示信息
                                if (res.code == 1 || res.code == 2) {
                                    if (window.IS_UC_PAGE_) { //用户中心页面登录，跳转到个人中心首页
                                        location.href = UC_PATH_ + "/userCenter/toUserCenterPage";
                                        return false;
                                    } else { //门户网站 关闭弹窗
                                        layer.msg('登录成功');
                                        getUserLoginStatus(); //更新tobbar状态
                                        var domain = window.location.href;
                                        if (domain == 'http://www.tmooc.cn/') {
                                            checkUserSpecial();
                                            MyCourse();
                                        }
                                        window.loginSuccessCallback.fire(res); //登录成功回调
                                        location.reload();
                                    }
                                    if (res.code == 2) {
                                        /*TTS用户验证提醒*/
                                        $.colorbox({
                                            speed: 0,
                                            inline: true,
                                            overlayClose: false,
                                            close: false,
                                            href: "#js_yz_video"
                                        });
                                    } else {
                                        $.colorbox && $.colorbox.close();
                                    }
                                } else if (res.code == -8009) {
                                	// 未激活
                                	if(loginNmae.indexOf("@")!=-1){
                                		$('#js_account_pm').before('<a href="http://uc.tmooc.cn/login/jumpToActiveMailobx" style="position: absolute;top: -17px;font-size: 12px;">该账号未激活，<span style="color:red">点击去激活</span></a>');
                                	}else{
                                		$('#js_account_pm').before('<a href="http://uc.tmooc.cn/login/jumpToActivePhoneobx?phone='+loginNmae+'" style="position: absolute;top: -17px;font-size: 12px;">该账号未激活，<span style="color:red">点击去激活</span></a>');
                                	}
                                } else if (res.code == -9001) {
                                    // 禁用
                                    layer.msg(res.msg);
                                } else {
                                    layer.msg(res.msg);
                                    refreshValidateImg();
                                }
                                t_.data('isclick', false).html('登录');

                            });
                        }
                    } else {
                        t_.data('isclick', false).html('登录');
                        layer.msg(res.msg);
                    }
                });
            }

        }
    });
    $('#js_password, #js_imgcode').keypress(function (e) {
        if (e.keyCode === 13) {
            $('#js_submit_login').trigger('click');
        }
    });
}

// 注册初始化
function initRegisterFn() {
    refreshValidateImg();
    $('.js-validate-img').click(function () {
        var $img = $(this).closest('.form-inp-area').find('img');
        refreshValidateImg($img.attr('id'));
    });
    // 切换tab
    $('#md_2018040401_ll').cusTab({
        callback: function (tabs_, target_) {
            if (target_.attr('id') == 'md_2018040401_ll_tab2') {
                refreshValidateImg('js_validate_img_m');
            } else {
                refreshValidateImg();
            }
        }
    });

    // 注册 方法
    function register(obj, type, loginName, password, nickName, validateCode) {
        if (!obj.data('issend')) {
            $.post(UC_PATH_ + "/user/registerAccount", {
                loginName: loginName,
                password: MD5(password),
                nickName: nickName,
                validateCode: validateCode,
                accountType: type
            }, function (res) {
                if (res.code != 1) {
                    obj.data('issend', false);
                    refreshValidateImg((type == 1 && 'js_validate_img_m'));
                    layer.msg(res.msg);
                } else {
                    if (window.IS_UC_PAGE_) { //用户中心页面登录，跳转到个人中心首页
                        layer.msg('注册成功,3s后跳转登录页');
                        setTimeout(function () {
                            location.href = UC_PATH_ + '/login/jumpTologin';
                        }, 3000);
                    } else {
                        $.colorbox && $.colorbox.close();
                        getUserLoginStatus(); //更新tobbar状态
                    }
                }
                window.registerSuccessCallback && window.registerSuccessCallback(res);
            });
            obj.data('issend', true);
        }
    }

    // 手机 动态验证码
    $('#js_DynamicCodePhone').click(function () {
        var t_ = $(this);
        var reg_account = $.trim($('#js_account_phone').val());
        var img_code = $.trim($('#js_imgcode_phone').val());

        var v_account = validateForm('js_reg_phone_form').checkform($('#js_account_phone'), reg_account, 'phone');
        var v_imgCode = validateForm('js_reg_phone_form').checkform($('#js_imgcode_phone'), img_code, 'code_en');

        if (v_account && v_imgCode) {
            sendValidateCode({
                obj: t_,
                url: UC_PATH_ + "/user/sendPhoneCode",
                data: {
                    phone: reg_account,
                    imgCode: img_code
                }
            });
        }
    });
    // 邮箱 动态验证码
    $('#js_DynamicCodeEmail').click(function () {
        var t_ = $(this);
        var reg_account = $.trim($('#js_account_mail').val());
        var img_code = $.trim($('#js_imgcode_mail').val());

        var v_account = validateForm('js_reg_mail_form').checkform($('#js_account_mail'), reg_account, 'mail');
        var v_imgCode = validateForm('js_reg_mail_form').checkform($('#js_imgcode_mail'), img_code, 'code_en');

        if (v_account && v_imgCode) {
            sendValidateCode({
                obj: t_,
                url: UC_PATH_ + "/user/sendEmail",
                data: {
                    email: reg_account,
                    imgCode: img_code
                }
            });
        }
    });
    // 手机 注册
    $('#js_submit_reg_phone').click(function () {
        if (!$('#js_form_user_regyx').is(':checked')) {
            layer.msg('请阅读并勾选同意用户注册协议！');
            return false;
        }
        if (validateForm('js_reg_phone_form').form()) {
            var account = $.trim($('#js_account_phone').val());
            var pwd = $.trim($('#js_pwd_phone2').val());
            var img_code = $.trim($('#js_imgcode_phone').val());
            var dy_code = $.trim($('#js_dy_code_phone').val());

            register($(this), 0, account, pwd, '', dy_code);
        }
    });
    // 邮箱 注册
    $('#js_submit_reg_mail').click(function () {
        if (!$('#js_form_user_regyx').is(':checked')) {
            layer.msg('请阅读并勾选同意用户注册协议！');
            return false;
        }
        if (validateForm('js_reg_mail_form').form()) {
            var account = $.trim($('#js_account_mail').val());
            var name = $.trim($('#js_name_mail').val());
            var pwd = $.trim($('#js_pwd_mail2').val());
            var img_code = $.trim($('#js_imgcode_mail').val());
            var dy_code = $.trim($('#js_dy_code_mail').val());

            register($(this), 1, account, pwd, name, dy_code);
        }
    });
    $('#js_dy_code_phone').keypress(function (e) {
        if (e.keyCode === 13) {
            $('#js_submit_reg_phone').trigger('click');
        }
    });
    $('#js_dy_code_mail').keypress(function (e) {
        if (e.keyCode === 13) {
            $('#js_submit_reg_mail').trigger('click');
        }
    });
}

// 下拉菜单-云笔记
$('#js_go_ynote').click(function (event) {
    window.open("http://inote.tmooc.cn" + "/login/loginnow?sessionId=" + getCookie("TMOOC-SESSION"));
    return false;
});

function getUserLoginStatus() { //获取用户的登录状态
    var login_stateObj = $('#login_statelty');
    if (login_stateObj.length == 0) {
        return false;
    }
    $.getJSON(UC_PATH_ + '/userValidate/getUserInfo', function (d) {
        if (d && d.code == '1') { //登录状态
            login_stateObj.find('.logined').show();
            login_stateObj.find('.no-login').hide();
            $('#no-login-nav').hide();
            $('#login-nav').show();
/*            $("#tobbar_username").text(d.obj.nickName).attr('href', UC_PATH_ + "/userCenter/toUserCenterPage")
*/
            $("#tobbar_username").attr('target', function () {
                    if (window.IS_UC_PAGE_) { //用户中心页面
                        return '_self';
                    }
                    return '_blank';
                });
            if (d.obj.pictureUrl) {
                $("#tobbar_userimg").attr('src', d.obj.pictureUrl);
            } else {
                $("#tobbar_userimg").attr('src', "http://cdn.tmooc.cn/tmooc-web/css/img/user-head.jpg");
            }
            $("#tobbar_userimg").parent('a').attr('href', UC_PATH_ + "/userCenter/toUserCenterPage")
                .attr('target', function () {
                    if (window.IS_UC_PAGE_) { //用户中心页面
                        return '_self';
                    }
                    return '_blank';
                });
            // 判断 tts 用户
            if (d.obj.userChannel && d.obj.userChannel == '10061007') {
                login_stateObj.find('#js_isshow_tts').show();
            } else {
                login_stateObj.find('#js_isshow_tts').hide();
            }
            check_old_sp_user();//登录成功回调历史付费用户方法
        } else {
            login_stateObj.find('.logined').hide();
            login_stateObj.find('.no-login').show();
            login_stateObj.find('.logined').hide();
            login_stateObj.find('.no-login').show();
            $("#tobbar_userimg").attr('src', "http://cdn.tmooc.cn/tmooc-web/css/img/user-head.jpg");
        }
    });
}

function check_old_sp_user() { //判断是否 历史付费用户
    var flag_ = false;
    $.getJSON(UC_PATH_ + '/userCenter/getUserBuy', function (d) {
        if (d && d.code == '1' && d.obj.status == '0') { //未激活用户
            layer.confirm('<div style="text-indent: 28px;">由于TMOOC网站升级改版，出于课程服务体验效果提升，部分旧站课程未做迁移（包括部分付费课程）。针对付费课程的已购学员，为弥补您的购买损失，TMOOC以您在旧站所购课程双倍价值的会员时长作为补偿，您在点击兑换后即可获得相应的会员时长。<br> <p style="text-indent: 28px">感谢您的理解与支持，祝您在TMOOC学习愉快！</p> <br> <p class="text-right">TMOOC 2018年6月12日</p></div>', {
                btn: ['已同意并确认兑换', '取消'],
                area: ['500px', 'auto']
            }, function (index) {
                if (!flag_) {
                    flag_ = true;
                    $.getJSON(UC_PATH_ + '/userCenter/updateUserBuy', function (dd) {
                        if (dd && dd.code == '1') { //激活兑换成功
                            layer.msg('兑换成功！');
                            layer.close(index);
                        } else {
                            layer.msg('兑换失败！请联系客服！');
                        }
                        flag_ = false;
                    });
                }
            });
        }
    });
}

function openPayStatusFn() { //打开支付状态弹窗
    $.colorbox({
        speed: 0,
        inline: true,
        overlayClose: false,
        close: false,
        href: "#md_2018040423_ll"
    });
}

function checkTtsUser(t,studentClassroomId) {
    var courseVersion='';
    if (t) {
        var courseVersion = t;
    }
    console.log('====',courseVersion);
    $.ajax({
        type: "post",
        url: UC_PATH_ + "/user/checkTtsUser",
        dataType: "json",
       // async: false,
        success: function (data) {
            if (data && data.code == 1) {
                // 是TTS用户，进入TTS
                window.location.href = TTS_MYTTS_URL + "/user/myTTS?sessionId=" + encodeURI(data.obj) + "&date=" + (encodeURI(new Date()))+"&courseVersion="+courseVersion+"&stuClassId="+studentClassroomId;
            } else {
                // 统一跳转到着陆页
                window.location.href = 'http://www.tmooc.cn/ttspages/online-class/web/TMOOC/index.shtml';
            }
        }
    });
    return false;
}

/* ccj */

/* lty */
/*导航列表对应页面点亮*/
$(function () {
    var url_ = window.location.pathname.replace('index.shtml', '');
    $.each($("#js_slide_nav a"), function () {
        var href_ = $(this).attr("href");
        if (href_) {
            href_ = /www.tmooc.cn(\/(\w+?\/)?)?/.exec(href_);
            if (href_ && href_[1] && href_[1] == url_) {
                $(this).parent().addClass('active');
                return false;
            }
        }
    });
});

/* lty */


/*2019年4月13日16:11:14  新增 */

//	$('body').append('<img class="fixed-0313img" id= "buyCourse" src="'+TTS_URL+'private/ttsfront/css/img190313/img_19031305_x.png"/>');
//发送验证码
var second = '';


//清空绑定的数据
function removeCourseValidInfo() {
    //获取到sessionid,courseName,phone,courseCode,相关信息
    //绑定到该该框中，courseInfoId
    $("#courseInfoId").removeData("courseName");
    $("#courseInfoId").removeData("phone");
    $("#courseInfoId").removeData("courseCode");
    $("#courseName").val("");
    $("#phone").val("");
}

//获取课程的相关信息
function getCourseValidInfo() {
    var courseName = $("#courseInfoId").data("courseName");
    var phone = $("#courseInfoId").data("phone");
    var courseCode = $("#courseInfoId").data("courseCode");
    var param = {"courseName": courseName, "phone": phone, "courseCode": courseCode};
    return param;
}

//设置定时器
var sendMessageSetInterval = "";
var second = '';

//发送验证码
function sendValidCode() {
    $('.error-lty span').html('');//清空错误信息
    if (second >= 1) {
        return;
    }
    $('#submitValidId').prop("disabled", false);//按钮复位
    //获取到sessionid,courseName,phone,courseCode,相关信息
    var param = getCourseValidInfo();
    //启动定时器，60秒后再次发送验证码
    second = 20;
    sendMessageSetInterval = setInterval(function () {
        second--;
        $('#sendMessageId').html(second + 's');
        if (second <= 0) {
            $('#sendMessageId').html("重新发送验证码").prop('disabled', false);
            clearInterval(sendMessageSetInterval);
            $('#submitValidId').prop("disabled", false);//按钮置灰
        }
    }, 1000)
    //发送异步请求获取相关数据
    $.ajax({
        type: "POST",
        url: UC_PATH_ + "/userValidate/doSendCodeMessage",
        data: param,
        dataType: "json",
        success: function (result) {
            if (result.code == 0) {
                $('.error-lty span').html(result.msg);
            }
            if (result.code == 1) {//发送成功
                $('.error-lty span').html('验证码发送成功');

            }
        },
        error: function () {
            console.info("error");
        }
    });
}


//提交验证码
function submitValidCode(courseversion,studymode,studentClassroomId) {
    $('.error-lty span').html('');//清空错误信息
    //
    //获取用户输入的信息
    var inputCode = $("#inputCode").val();
    if (inputCode.length != 6) {
        $('.error-lty span').html('请输入6位验证码');
        return;
    }
    //获取到sessionid,courseName,phone,courseCode,相关信息
    var param = getCourseValidInfo();
    param.code = inputCode;
    //发送异步请求获取相关数据
    $('#submitValidId').prop("disabled", true);//按钮置灰
    $.ajax({
        type: "POST",
        url: UC_PATH_ + "/userValidate/doValidateCode",
        data: param,
        dataType: "json",
        success: function (result) {
            if (result.code == 0) {
                $('.error-lty span').html(result.msg);
            }
            if (result.code == 1) {//发送成功
                $('.error-lty span').html('验证成功,5秒后自动跳转...');
                removeCourseValidInfo();
                setTimeout(function () {
                	if(courseversion || studymode){
                		//跳转到tts教历页
                		checkTtsUser(courseversion,studentClassroomId);
                	}else{
                		//刷新当前页
                		window.location.reload();
                		
                	}
                }, 5000);

            }else{
            	 $('#submitValidId').prop("disabled", false);//按钮置灰
            }
        },
        error: function () {
            console.info("error");
        }
    });
}

//输入框关闭的时候清空绑定的数据
function closeCancel() {
    //removeCourseValidInfo();
}

function doUserValidate(obj) {
    $('.error-lty span').html('');//清空错误信息
    $("#inputCode").val('');//清空数据
    appendHtml();
    $('#courseName').val($(obj).parent().parent().data("courseName"));
    $('#phone').val($(obj).parent().parent().data("phone"));
    if (second <= 0) {
        $('#submitValidId').prop("disabled", false);//按钮复位
    }
    //获取到sessionid,courseName,phone,courseCode,相关信息
    //绑定到该该框中，courseInfoId
    $("#courseInfoId").data("courseName", $(obj).parent().parent().data("courseName"));
    $("#courseInfoId").data("phone", $(obj).parent().parent().data("phone"));
    $("#courseInfoId").data("courseCode", $(obj).parent().parent().data("courseCode"));
}

function courseValidate() {

    $.colorbox({
        speed: 0,
        inline: true,
        overlayClose: false,
        close: false,
        href: "#tk-box",

    });
}

function enterCourse(result) {
    window.open(pageUrl);
}

function appendHtml() {
    var courseValidateHtml = '<div style="display:none"><div id="tk-box">'
        + '<div class="md-2018040401-ll cus-win-model md2018041302lty" >'
        + '<form autocomplete="off">'
        + '<div class="form-ele-box">'
        + '<div class="form-item clearfix">'
        + '<div class="tit" style="font-size: 20px;text-align: center;padding: 20px 0 30px;">课程验证</div>'
        + '</div>'
        + '<div class="form-item clearfix">'
        + '<label>课程名称：</label><input class="form-input pull-right" id="courseName" readonly value="" type="text" style="width: 260px;" >'
        + '</div>'
        + '<div class="form-item clearfix">'
        + '<label>手机号码：</label><input class="form-input pull-right" id="phone" readonly value="" readonlytype="text" style="width: 260px;" >'
        + '</div>'
        + '<div class="form-item clearfix">'
        + '<input class="form-input pull-left" id="inputCode" value="" type="text" style="width: 200px;" >'
        + '<button class="form-btn form-btn-blue pull-right" type="button" id="sendMessageId" style="width: 130px;" onclick="sendValidCode();">发送验证码</button>'
        + '<div class="error-lty error-show color-red"><span></span></div>'
        + '</div>'
        + '<div class="form-item clearfix">'
        + '<button class="form-btn form-btn-blue width-100" type="button" id="submitValidId" onclick="submitValidCode();">提交验证码</button>'
        + '</div>'
        + '</div>'
        + '<input type="hidden" id="courseInfoId">'
        + '<span class="cus-win-modelclose js-closewin-btn" onclick="closeCancel();"><i class="cusfont cusfont-close font-14"></i></span>'
        + '</form></div></div></div>';
    $('body').append(courseValidateHtml);
}

function specialCourse() {
    $.ajax({
        type: "POST",
        url: UC_PATH_ + "/user/checkSpecial",
        dataType: "json",
        success: function (result) {
            if (result.code == 3) {//是特色学员，但是未转化
                appendHtml();
                $('#courseName').val(result.obj.courseName);
                $('#phone').val(result.obj.phone);
                $("#courseInfoId").data("courseName", result.obj.courseName);
                $("#courseInfoId").data("phone", result.obj.phone);
                $("#courseInfoId").data("courseCode", result.obj.studentOrderCode);
                courseValidate();
            } else if (result.code == 1) {//是特色学员，并且已经转化完了
                pageUrl = result.obj.pageUrl;
                window.open(pageUrl);
            } else if (result.code == 4) {
                layer.msg('课程已经过期，请重新报名！');
            }
        },
        error: function () {
            console.info("error");
        }
    });
}

function checkUserSpecial() {
    $.ajax({
        type: "POST",
        url: UC_PATH_ + "/user/checkUserSpecial",
        dataType: "json",
        success: function (result) {
            if (result.code == 1) {//是特色学员，但是未转化
                $('body').append('<img class="fixed-0313img" id="specialCourse" onclick="specialCourse()" src="http://cdn.tmooc.cn/tmooc-web/css/img/enter_course.png"/>');
            }
        },
        error: function () {
            console.info("error");
        }
    });

}

//更新用户行为时间
function updateLearningTime(userSingUpId){
	  $.ajax({
         url: UC_PATH_ + '/course/updateUserCourseLearningTime',
         dataType: 'json',
         type: 'POST',
         data: {
        	 userSingUpId: userSingUpId
         },
         success: function (res) {
       	  console.log("updateLearningTime success");
         },
	  })
}

/*20190827新增，消息*/
$.get(UC_PATH_+'/message/getMsgNum',function (res){
    if (res) {
        if (res > 99) {
            res=99;
        }
        if (res>0){
            $('.js-mes-length2,.js-mes-length3,.hasmes1').show().text(res);
        }
    }
});

/*20200721 广告位*/
if ($('.js-close200721').length){
    $('body').on('click','.js-close200721',function(){
        $(this).closest('.js-modo').hide();
    });
}