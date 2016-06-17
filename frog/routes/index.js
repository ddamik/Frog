var express = require('express');
var router = express.Router();

var schedule = require('node-schedule');
var easyimg = require('easyimage');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) { // 어느 디렉토리에 저장할 것인가
    // if( 파일의 형식이 이미지 )
    cb(null, './public/images/');     // /public/images에 업로드
    // else if ( 파일의 형식이 텍스트 ) cb(null, './public/texts');
  },
  filename: function (req, file, cb) {  // 디렉토리에 저장할 파일의 이름을 어떻게 할것인가

    console.log('1------------------------------------------------1');
    console.log(file);

    var originalname = file.originalname;
    var tmp = file.mimetype; // 'image/jpeg', 'image/png', 'image/gif'
    tmp = tmp.split('/')[1];
    if(tmp == 'jpeg') { tmp = 'jpg' };

    var ext = "." + tmp;
    var filename = originalname.substring(0, originalname.lastIndexOf('.'));
    console.log('filename=', filename);

    console.log('1------------------------------------------------1 filename function last', ext);
    console.log('1------------------------------------------------1 file.filename + ext', filename+ext);


    cb(null, filename + ext);       // 디렉토리에 filenmae+ext로 업로드
  }
});
var upload = multer({ 'storage': _storage });



var db = require('../models/db');
require('../models/activityModel');
var ActivityModel = db.model('Activity');
var activity = require('../models/activityModel');

require('../models/interviewModel');
var InterviewModel = db.model('Interview');
var interview = require('../models/interviewModel');

require('../models/likeactivityModel');
var LikeActivityModel = db.model('LikeActivity');
var likeActivity = require('../models/likeactivityModel');

require('../models/memberModel');
var MemberModel = db.model('Member');
var member = require('../models/memberModel');

require('../models/postscriptModel');
var PostScriptModel = db.model('PostScript');
var postscript = require('../models/postscriptModel');

require('../models/provisionModel');
var ProvisionModel = db.model('Provision');

require('../models/notificationModel');
var notification = require('../models/notificationModel');


var path = "http://52.79.179.176:3000/images/";
// var path = "http://localhost:3000/images/";
var searchActivityValue = 1;
var activityPageValue = 2;
var conditionsActivityValue = 3;
var highStarActivityValue = 4;
var highRateActivityValue = 5;
var recommandListValue = 6;

var statusOk = { "status": "OK" };
var statusFail = { "status": "Fail" };
var statusNotFound = { "status": "Not Found Object" };

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('/index/');
  console.log('req.session', req.session);
  res.render('web_index', { title: 'Login Page' }); 
});


// *************************** Home Page *************************** //
router.get('/homePage', function(req, res, next){
  console.log('homePage req.session.loginEmail=', req.session.loginEmail);
  activity.homePage(function(data){
    console.log('homePage data=', data);
    res.json(data);
  });
});




router.get('/homeSearch/:activityName', function(req, res, next){
  var search = req.params.activityName;  
  activity.homeSearch(search, function(result){ 
    console.log('result=', result);
    res.json(result); 
  });
});




// *************************** Activity Page *************************** //
router.get('/userNoticeList', function(req, res, next){
  console.log('/index/userNoticeList');
  notification.pushList(req, function(result){ 
    console.log('/index/.... result', result);
    res.json(result); });
});


router.get('/activityPage', function(req, res, next){
  console.log('activityPage req.session.loginEmail=', req.session.loginEmail);
  activity.getActivity(req, activityPageValue, function(datas){    
    console.log('activityPage');
    res.json(datas);
  });
});


// 대외활동 명 가져오기.
router.get('/mainActivityList', function(req, res, next){
  activity.nameList(function(result){
    console.log('index /mainActivityList');
    res.json(result);
  }); // activity.nameList
});


// 수정 필요
router.post('/conditionsActivity', function(req, res, next){
  
  // db.getCollection('activities').find({$and:[  {'region':{$regex:'서울'}}, {'strDuring':{$regex:'1 개월'}}, {'indus':{$regex:'1 개월'}}, {'actClass':{$regex:'1 개월'}}  ]})
  activity.getActivity(req, conditionsActivityValue, function(datas){    
    console.log('conditionsActivity', datas);
    res.json(datas);
  });   //  getConditionsActivity
});



// 별점 높은 순
router.post('/highStarActivity', function(req, res, next){
  activity.getActivity(req, highStarActivityValue, function(datas){    
    console.log('highStartActivityValue');
    res.json(datas);
  });
});


// postscript 많은 순
router.post('/highRateActivity', function(req, res, next){
  activity.getActivity(req, highRateActivityValue, function(datas){    
    console.log('highRateActivity');
    res.json(datas);
  });
});


// *************************** Detail Activity *************************** //
router.get('/likeStatusChange/:activitySeq', function(req, res, next){
  var activitySeq = req.params.activitySeq; 
  
  member.getMemberSeq(req, function(memSeq){
    if(!memSeq) res.json(statusFail);
    else likeActivity.likeStatusChange(activitySeq, memSeq, function(datas){ res.json(datas); }); 
  }); // getMemberSeq
}); //likeStatusChange


router.get('/detailActivity/header/:activitySeq', function(req, res, next){
  var activitySeq = req.params.activitySeq;
  
  member.getMemberSeq(req, function(memSeq){
    if(!memSeq) res.json(statusFail);
    else activity.detailActivityHeader(activitySeq, memSeq, function(datas){ res.json(datas); }); // activity.detailActivityHeader
  }); // getMemberSeq
});


// detailActivity/guide
router.get('/detailActivity/guide/:activitySeq', function(req, res, next){
  var activitySeq = req.params.activitySeq;
  activity.detailActivityGuide(activitySeq, function(datas){
    console.log(datas);
    res.json(datas);
  }); // 
}); // detailAcitivty/guide


// detailActivity/interview(interviewList)
router.get('/detailActivity/interviews/:activitySeq', function(req, res, next){
  var activitySeq = req.params.activitySeq;
  console.log('1-------------------------------------1     /index/detail ACtivity Interview activitySeq = ' , activitySeq);
  activity.detailActivityInterviews(activitySeq, function(datas){
    res.json(datas);
  }); // detailActivityInterview
}); // detailActivity/Interview


// detailActivity/postscript
router.get('/detailActivity/postscripts/:activitySeq', function(req, res, next){
  var activitySeq = req.params.activitySeq;
  console.log('1-------------------------------------1      detail ACtivity Postscript activitySeq = ' , activitySeq);
  activity.detailActivityPostscripts(activitySeq, function(datas){
    res.json(datas);
  }); // detailActivityPostscripts
}); // api/detail


// 추천 알고리즘 적용해야함.
// detailActivity/recommend
router.get('/recommandList', function(req, res, next){
  activity.getActivity(req, recommandListValue, function(datas){ res.json(datas); });
}); // recommandList


// 면접후기 상세 페이지
router.get('/detailInterview/:interviewSeq', function(req, res, next){  
  var interviewSeq = req.params.interviewSeq;

  interview.detailInterview(interviewSeq, function(datas){
    console.log('detailInterview data=', datas);
    res.json(datas);
  }); // detailInterview  
}); // api/detailInterview



router.get('/detailPostscript/:postscriptSeq', function(req, res, next){
  var postscriptSeq = req.params.postscriptSeq;

  postscript.detailPostscript(postscriptSeq, function(datas){
    console.log('detailPostscript datas=', datas);
    res.json(datas);
  }); // detailPostscript
}); // detailPostscript


// ************************* My Page ************************* //
var async = require('async');
router.get('/myPage', function(req, res, next){  
  member.getMemberSeq(req, function(memSeq){
    console.log('/myPage memSeq=', memSeq);

    if(!memSeq) res.json(statusFail);
    else member.myPage(memSeq, function(datas){ 
        console.log('datas=', datas);
    res.json(datas); 
    }); // myPage
  }); // getMemberSeq
});


// 활동내역의 나의 활동후기
router.get('/myPage/postscripts', function(req, res, next){
  member.getMemberSeq(req, function(memSeq){
    console.log('myPage/postscripts memSeq=', memSeq);

    if(!memSeq) res.json(statusFail);
    else member.postscripts(memSeq, function(datas){ res.json(datas); }); // member.postscripts
  }); // getMemberSeq
});   //  api/...


// 활동내역의 나의 면접후기
router.get('/myPage/interviews', function(req, res, next){
  member.getMemberSeq(req, function(memSeq){
    console.log('mypage/interviews memSeq', memSeq);

    if(!memSeq) res.json(statusFail);
    else member.interviews(memSeq, function(result){ res.json(result); }); // member.interviews 
  }); // getMemberSeq
});


router.get('/myPage/moreActivity', function(req, res, next){
  member.getMemberSeq(req, function(memSeq){
    console.log('/mypage/moreActivity memSeq=', memSeq);

    if(!memSeq) res.json(statusFail);
    else member.moreActivity(memSeq, function(result){ res.json(result); }); // member.moreActivity
  }); // getMemberSeq
});


router.get('/myPointCheck/:activitySeq', function(req, res, next){
    var activitySeq = req.params.activitySeq;
    console.log('/index/myPointCheck');
    member.pointCheck(req, activitySeq, function(result){ res.json(result); });
});


router.get('/writeFormInfo/:activitySeq', function(req, res, next){
    var seq = req.params.activitySeq;
    activity.getFormActivity(seq, function(result){ console.log('3----------------------------------------3', result); res.json(result); });
});




// ************************* Post ****************************** //
router.post('/writePostscript', function(req, res, next){
  console.log('req.body=', req.body);
  postscript.writePostscript(req, function(result){ res.json(result); });  // postscript.write 
});



router.post('/writeInterview', function(req, res, next){
  console.log('/index/writeInterview');
  interview.writeInterview(req, function(result){ res.json(result); }); // interview.writeInterview 
}); // api/writeInterview



// get? post? // 무하는거지?
router.get('/likeActivity/:activitySeq/:memSeq', function(req, res, next){
  var activitySeq = req.params.activitySeq;
  var memSeq = req.params.memSeq;

  var likeActivity = new LikeActivityModel({
    activitySeq: activitySeq,
    member: memSeq
  });

  likeActivity.save(function(err){
    if(err) return res.status(500).json( {error: 'database fail likeActivity save' });
    res.json(likeActivity);
  }); // likeActivity.save
}); 







// *********************** 관심 대외활동 / 관심 산업군 ********************************** //
router.get('/actClass', function(req, res, next){
  var obj = { "title": "actClassChange" }
  res.render('testArray', obj);
});


router.get('/myActClass', function(req, res, next){
  member.getMemberSeq(req, function(memSeq){
    console.log('/myActClass memSeq=', memSeq);

    if(!memSeq) res.json(statusFail);
    else member.myActClass(memSeq, function(result){ res.json(result); }); 
  }); // getMemberSeq
}); // myActClass


router.post('/actClassChange', function(req, res, next){
  
  member.getMemberSeq(req, function(memSeq){
    console.log('actClassChange'); 

    if(!memSeq) res.json(statusFail);
    else member.myActClassChange(memSeq, req.body, function(result){ res.json(result); }); // member.myActClass
  }); // getMemberSeq
});


// memSeq의 관심산업 목록
router.get('/myIndus', function(req, res, next){
  member.getMemberSeq(req, function(memSeq){
    if(!memSeq) res.json(statusFail);
    else member.myIndus(memSeq, function(result){ res.json(result); });
  }); // getMemberSeq
});


router.post('/indusChange', function(req, res, next){
  member.getMemberSeq(req, function(memSeq){
    console.log('indusChange memSeq=', memSeq);

    if(!memSeq) res.json(statusFail);
    else member.myIndusChange(memSeq, req.body, function(result){ res.json(result); });
  }); // getMemberSeq
});






// *********************** SignUp & Login ***************************** //
// 인증 전 메일 발송상태
router.post('/signUp', function(req, res, next){
  console.log('index/signUp');
  member.signUp(req, function(result){ res.json(result); });
});


router.get('/autoLogin', function(req, res, next){
  console.log('/index/autoLogin');
  member.autoLogin(req, function(result){ res.json(result); });
});


// post로 업데이트
router.post('/facebookLogin', function(req, res, next){
  console.log('/index/facebookLogin');
  member.facebookLogin(req, function(result){  res.json(result); });
});


router.post('/login', function(req, res, next){
  console.log('/index/login');
  member.login(req, function(result){ res.json(result); });
});


router.get('/logout', function(req, res, next){
  console.log('/index/logout');
  member.logout(req, function(result){ res.json(result); });
});


router.get('/checkMail/:mail/:num', function(req, res, next){
  var loginEmail = req.params.mail;
  var num = req.params.num;

  ProvisionModel.findOne( {'loginEmail':loginEmail}, function(err, provision){
    if(err) res.json({error:'database error provision model return mail'});
    if(!provision) res.json(statusNotFound);
    if(num == provision.num){

      provision.update({$set:{'checkProvision': 1}}, function(err){     // 인증메일의 링크를 클릭하면 이메일 인증확인으로 변경
        if(err) res.json({error:'database error provision update'});
      });

      var pwd = provision.pwd;
      var tmpMember = new MemberModel({                   // 회원가입 준비
        'loginEmail': loginEmail, 
        'pwd': pwd
      });

      MemberModel.findOne( {'loginEmail':loginEmail}, function(err, member){
        if(err) res.json({error:'database error signUp'});
        if(!member){                            // 기존에 없는 회원이라면
            tmpMember.save(function(err){                 // 회원등록
              if(err) res.json({error:'database error member save in ProvisionModel'});
              res.send('<script>alert("로그인 이메일 인증완료!");</script>')      
            });  
        }else res.json(statusFail);                         // 그게 아니면 fail
      });      
    } else res.json(statusFail);// if(num==provision.num)           // 발생시킨 난수와 다르면 fail
  }); // ProvisionModel
}); // checkMail


router.post('/studentConfirm', function(req, res, next){
  console.log('studentConfirm');
  member.sendUnivMail(req, function(result){ res.json(result); });
}); // studentConfirm


router.get('/checkUnivMail/:email', function(req, res, next){
  var loginEmail = req.params.email;

  console.log('member checkUnivMail');

  MemberModel.findOne({'loginEmail':loginEmail}, function(err, member){
    if(err) callback({error:'database error member checkUniveMail'});
    if(!member) callback(statusNotFound);
      member.update({$set:{'provisionCheck':1}}, function(err){
        if(err) callback({error:'database error provisionCheck error'});
        console.log('checkUniveMail member=', member);
        res.send('<script>alert("대학교 이메일 인증완료!");</script>')
      }); // member.update
  }); // MemberModel
}); 


router.post('/quotation', function(req, res, next){
  console.log('/index/quotation');
  member.quotation(req, function(result){ res.json(result); });
});


router.get('/quotation', function(req, res, next){
  console.log('/quotation/:email');
  member.quotationCheck(req, function(result){ res.json(result); });
}); // qoutation


router.post('/changePwd', function(req, res, next){
  console.log('/index/changePwd');
  member.changePwd(req, function(result){ res.json(result); });
});


router.post('/alramCheck', function (req, res, next){
  console.log('/index/alramCheck-post');
  member.alramCheck(req, function (result){ res.json(result); });
});


router.get('/alramCheck', function(req, res, next){
  console.log('/index/alramCheck-get');
  member.getAlram(req, function(data){ console.log('get alramCheck data=', data); res.json(data); });
});


router.get('/sessionCheck', function(req, res, next){
  console.log('/index/sessionCheck');
  member.sessionCheck(req, function(result){ res.json(result); });
});


router.get('/accountInfo', function(req, res, next){
  console.log('hello accountInfo');
  member.accountInfo(req, function(result){ res.json(result); });
});





// 42분에 실행이 된다.
var gcmSchedule = schedule.scheduleJob('0 0 12 * * *', function(){
  console.log('/index --> gcmScheduler' );
  likeActivity.pushGCM(function(result){ console.log('GCM Schedule / push GCM / '+ result); });
});


router.get('/testWhere', function(req, res, next){
  console.log('/index/testWhere');
  activity.testWhere(function(result){console.log('result=',result); res.json(result); });
});







//  ******************* End Project ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  ******************* End Project ******************* //




// ******************* For Process(WebPage) ******************************** //
//  ******************* Activity ******************* //
router.get('/web/signUpPage', function(req, res, next){
  var obj = { "title": "회원가입 페이지" }
  res.render('signUpPage', obj);
});


router.post('/web/login', function(req, res, next){
  var loginEmail = req.body.email;
  var pwd = req.body.pwd;

  if(loginEmail == 'admin' && pwd == 'admin' ){
    req.session.loginEmail = loginEmail;
    res.redirect('/web/activityList');  
  }
}); 

router.get('/web/logout', function(req, res, next){
  console.log('1------------------------------------------------1     /index/web/logout');

  req.session.destroy(function(err){
    if(err) console.log('err', err);
    console.log('req.session.destroy');
    web_sessionCheck(req);
    res.redirect('/');
  });
});


router.get('/web/detailActivity/:activitySeq', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  var seq = req.params.activitySeq;
  activity.webGetActivity(seq, function(result){ 
    res.render('web_detailActivity', result); 
    // res.json(result);
  });
});

router.get('/web/writeActivity', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  res.render('web_writeActivity');
});


router.post('/web/insertActivity', upload.array('activityImg', 3),  function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  console.log('2------------------------------------------------2     req.body=', req.body);
  console.log('2------------------------------------------------2     req.file=', req.files[0]);
  // console.log('2------------------------------------------------2     req.file=', req.file);


  // 파일이 여러개여서 req.files[], 순서대로 0~file.length
  // 현재 req.file이 undefined인데 그 이유는, activityImg가 배열로 묶여서 file이 들어오는게 아니라 file명만 들어오고 있음.   
  var guideFile = req.files[0];
  var recruitFile = req.files[1];
  var companyLogoFile = req.files[2];

  var guidePath = path + guideFile.originalname;
  var recruitPath = path + recruitFile.originalname;
  var companyLogoPath = path + companyLogoFile.originalname;

  activity.insertActivity(req, guidePath, recruitPath, companyLogoPath, function(result){ 
    console.log('insertActivity result=', result);
    res.redirect('/web/activityList'); 
  });
});

router.get('/web/activityList', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  activity.activityList(function(result){ res.render('web_activityList', result); })
});


router.get('/web/updateActivity/:activitySeq', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  var seq = req.params.activitySeq;
  activity.findOneActivity(seq, function(result){ res.render('web_updateActivity', result); });
});


router.post('/web/updateActivity', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  activity.webUpdateActivity(req, function(result){ res.redirect('/web/detailActivity/'+result); });
});




// ****************************** Postscript ****************************** //
router.get('/web/formPostscript/:activitySeq', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  var activitySeq = req.params.activitySeq;
  activity.findOneActivity(activitySeq, function(result){ res.render('web_writeFormPostscript', result); });
});


router.post('/web/writePostscript', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');
  // res.send('<script>alert("로그인 이메일 인증완료!");</script>')      
  postscript.insertPostscript(req, function(result){ res.redirect('/web/detailActivity/'+result); });
});


router.get('/web/detailPostscript/:postSeq/:activitySeq', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  var seq = req.params.postSeq;
  var activitySeq = req.params.activitySeq;
  postscript.webDetailPostscript(seq, activitySeq, function(result){ res.render('web_detailPostscript', result); });
});


router.post('/web/updatePostscript', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  postscript.updatePostscript(req, function(result){ res.redirect('/web/detailActivity/'+result); });
});


router.get('/web/webDeletePost/:postSeq', function(req, res, next){
  var seq = req.params.postSeq;
  postscript.webDeletePost(seq, function(result) { res.json(result); });
});

// ****************************** Interview ****************************** //
router.post('/web/updateInterview', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  interview.updateInterview(req, function(result){ res.redirect('/web/detailActivity/'+result); });
});

router.get('/web/detailInterview/:interSeq/:activitySeq', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  var seq = req.params.interSeq;
  var activitySeq = req.params.activitySeq;
  interview.webDetailInterview(seq, activitySeq, function(result){ res.render('web_detailInterview', result); });
});

router.get('/web/formInterview/:activitySeq', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  var activitySeq = req.params.activitySeq;
  activity.findOneActivity(activitySeq, function(result){ res.render('web_writeFormInterview', result); });
});

router.post('/web/writeInterview', function(req, res, next){
  if(!web_sessionCheck(req)) res.redirect('/');

  interview.insertInterview(req, function(result){ res.redirect('/web/detailActivity/'+result); });
});

router.get('/web/delInterview/:seq', function(req, res, next){
  var seq = req.params.seq;
  interview.deleteInterview(seq, function(result){ res.json(result); });
});


function web_sessionCheck(req){  
  console.log('web_sessionCheck');
  var loginEmail = req.session.loginEmail;
  if(!loginEmail){
    console.log('1-----------------------------------------1 not function');
    return false;
  }
  else{
    console.log('1-----------------------------------------1 exist');
    return true;
  } 
}





//  ******************* End Project ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  *******************             ******************* //
//  ******************* End Project ******************* //





router.get('/signUpPage', function(req, res, next){
  var obj = { "title": "회원가입 페이지" }
  res.render('signUpPage', obj);
});

router.get('/loginPage', function(req, res, next){
  var obj = { "title": "로그인 페이지" }
  res.render('loginPage', obj);
});

router.get('/changePwd', function(req, res, next){
  var obj = { "title": "비밀번호 변경" }
  res.render('changePwdPage', obj);
});



router.get('/testGCM', function(req, res, next){
  console.log('/index/testGCM');
  likeActivity.pushGCM(function(result){ console.log('GCM Schedule / push GCM / '+ result); res.json(result); });
});

router.get('/createMember', function(req, res, next){
  member.createMember(function(result){ res.json(result); });
});

router.get('/getMember/:seq', function(req, res, next){
  seq = req.params.seq;
  member.getMember(seq, function(result){ res.json(result); });
});

module.exports = router;