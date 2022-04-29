var express = require('express');
var router = express.Router();
var i18n = require('i18n');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.__('Hello'));
  var api = [];
  api.push({
    title: 'API get token',
    method: 'post',
    url: "/aaa/v02/authen/signin"
  });
  api.push({
    title: 'API lấy danh sách hồ sơ',
    method: 'get',
    url: "/ui-service/v1/collection/total-list"
  });
  api.push({
    title: 'API get customer Info',
    method: 'get',
    url: "/crm/v1/customer/info"
  });
  api.push({
    title: 'API check thông tin thanh toán hợp đồng',
    method: 'post',
    url: "/ui-service/collection/v1/payment-info"
  });

  api.push({
    title: 'API annex tính tất toán hợp đồng',
    method: 'post',
    url: "/ui-service/lms-cashloan/v1/termination/annex"
  });




  res.json(
      {
        title: req.__('Hello') ,
        api_list: api
    });
});

router.post('/aaa/v02/authen/signin', function (req, res, next) {
  var json = '{\n'
      + '\t"status": 0,\n'
      + '\t"uiid": 4098,\n'
      + '\t"token": "2022-03-22T10:20:39.582Z_4098_3483352",\n'
      + '\t"msg": "Dang nhap thanh cong",\n'
      + '\t"info": {\n'
      + '\t\t"name": null,\n'
      + '\t\t"phone": null,\n'
      + '\t\t"email": null,\n'
      + '\t\t"portrait": null,\n'
      + '\t\t"forceFirstLogin": 0,\n'
      + '\t\t"user_group": null\n'
      + '\t},\n'
      + '\t"role": {\n'
      + '\t\t"code": "CO",\n'
      + '\t\t"value": "SCO",\n'
      + '\t\t"name": "Collection"\n'
      + '\t},\n'
      + '\t"functions": {\n'
      + '\t\t"EDIT_CHANGE_PASSWORD": {\n'
      + '\t\t\t"code": "EDIT_CHANGE_PASSWORD",\n'
      + '\t\t\t"name": "Sửa thay đổi thông tin mật khẩu"\n'
      + '\t\t}\n'
      + '\t}\n'
      + '}';
  var obj = JSON.parse(json);
  res.json(obj);
});

router.get('/ui-service/v1/collection/total-list', function(req, res, next) {
  var json = '{\n'
      + '\t"code": 0,\n'
      + '\t"message": "Success",\n'
      + '\t"data": {\n'
      + '\t\t"size": 20,\n'
      + '\t\t"page": 1,\n'
      + '\t\t"total": 1200,\n'
      + '\t\t"totalContract": 450123,\n'
      + '\t\t"totalAllDebtAmt": 123456000,\n'
      + '\t\t"totalAllPriAmt": 111456000,\n'
      + '\t\t"contractList": [{\n'
      + '\t\t\t"contractNumber": "2200000593",\n'
      + '\t\t\t"custId": "10002123",\n'
      + '\t\t\t"fullName": "Trần Văn A",\n'
      + '\t\t\t"idNumber": "09877123456",\n'
      + '\t\t\t"totalDebtAmt": 12500000,\n'
      + '\t\t\t"totalPriAmt": 9000000,\n'
      + '\t\t\t"currentBucket": "B0",\n'
      + '\t\t\t"maxBucket": "B1",\n'
      + '\t\t\t"dpd": 20,\n'
      + '\t\t\t"dpdBom": 20,\n'
      + '\t\t\t"bucketBom": "B3",\n'
      + '\t\t\t"productName": "Zalo",\n'
      + '\t\t\t"status": "ACT",\n'
      + '\t\t\t"lastPaymentDate": "2022-02-13 22:00:00",\n'
      + '\t\t\t"lastPaymentAmount": 100000,\n'
      + '\t\t\t"totalPaymentInMonth": 500000,\n'
      + '\t\t\t"totalPayment": 900000,\n'
      + '\t\t\t"resolved": "RF",\n'
      + '\t\t\t"curProvince": "Hà Nội",\n'
      + '\t\t\t"curDistrict": "Cầu Giấy",\n'
      + '\t\t\t"curWard": "Mai Dịch",\n'
      + '\t\t\t"tempAddress": "10, Cầu Giấy, HN",\n'
      + '\t\t\t"perProvince": "Hà Nội",\n'
      + '\t\t\t"perDistrict": "Cầu Giấy",\n'
      + '\t\t\t"perWard": "abc",\n'
      + '\t\t\t"perAddress": "10, Cầu Giấy, HN",\n'
      + '\t\t\t"companyDistrict": null,\n'
      + '\t\t\t"companyAddress": null\n'
      + '\n'
      + '\t\t}, {\n'
      + '\t\t\t"contractNumber": "2200000594",\n'
      + '\t\t\t"custId": "10002124",\n'
      + '\t\t\t"fullName": "Trần Văn B",\n'
      + '\t\t\t"idNumber": "09877123456",\n'
      + '\t\t\t"totalDebtAmt": 12500000,\n'
      + '\t\t\t"totalPriAmt": 9000000,\n'
      + '\t\t\t"currentBucket": "B0",\n'
      + '\t\t\t"maxBucket": "B1",\n'
      + '\t\t\t"dpd": 20,\n'
      + '\t\t\t"dpdBom": 20,\n'
      + '\t\t\t"bucketBom": "B3",\n'
      + '\t\t\t"productName": "Zalo",\n'
      + '\t\t\t"status": "ACT",\n'
      + '\t\t\t"lastPaymentDate": "2022-02-13 22:00:00",\n'
      + '\t\t\t"lastPaymentAmount": 100000,\n'
      + '\t\t\t"totalPaymentInMonth": 500000,\n'
      + '\t\t\t"totalPayment": 900000,\n'
      + '\t\t\t"resolved": "RF",\n'
      + '\t\t\t"curProvince": "Hà Nội",\n'
      + '\t\t\t"curDistrict": "Cầu Giấy",\n'
      + '\t\t\t"curWard": "abc",\n'
      + '\t\t\t"curAddress": "10, Cầu Giấy, HN",\n'
      + '\t\t\t"perProvince": "Hà Nội",\n'
      + '\t\t\t"perDistrict": "Cầu Giấy",\n'
      + '\t\t\t"perWard": "abc",\n'
      + '\t\t\t"perAddress": "10, Cầu Giấy, HN",\n'
      + '\t\t\t"companyDistrict": null,\n'
      + '\t\t\t"companyAddress": null\n'
      + '\t\t}]\n'
      + '\t}\n'
      + '}';
  res.json(JSON.parse(json));
});


router.get('/crm/v1/customer/info', function(req, res, next) {
  var json = '{\n'
      + '    "status": 1,\n'
      + '    "msg": "Lay thong tin thanh cong",\n'
      + '    "data": [\n'
      + '        {\n'
      + '            "custId": "A601HQU2",\n'
      + '            "idNumber": "038092015423",\n'
      + '            "idType": null,\n'
      + '            "idIssueDt": "2019-06-26T17:00:00.000Z",\n'
      + '            "idIssuePlace": "VIP16",\n'
      + '            "addressCur": "Số 8, căn 7, nhà N12 Binh Đoàn 11",\n'
      + '            "provinceCur": "Hà Nội",\n'
      + '            "districtCur": "019",\n'
      + '            "wardCur": "Trung Văn",\n'
      + '            "villageCur": null,\n'
      + '            "addressPer": "76 Kiều Đại 2",\n'
      + '            "provincePer": "Thanh Hóa",\n'
      + '            "districtPer": "380",\n'
      + '            "wardPer": "Đông Vệ",\n'
      + '            "villagePer": null,\n'
      + '            "parentId": null,\n'
      + '            "fullName": "MAI THỊNH HƯNG",\n'
      + '            "userCreatedId": null,\n'
      + '            "custType": "I",\n'
      + '            "birthDate": "1992-02-25T17:00:00.000Z",\n'
      + '            "education": null,\n'
      + '            "marriedStatus": "C",\n'
      + '            "gender": "M",\n'
      + '            "houseType": "F",\n'
      + '            "numOfDependants": 0,\n'
      + '            "salaryMethod": "TRANS",\n'
      + '            "salaryFrequency": "M",\n'
      + '            "salaryPaymentDay": 1,\n'
      + '            "incomeProofFlag": "N",\n'
      + '            "incomeProofAmount": "820252184.000",\n'
      + '            "emplType": "SE",\n'
      + '            "isDelete": 0,\n'
      + '            "jobType": "STS",\n'
      + '            "jobTitle": "BOR",\n'
      + '            "emplCtrctType": null,\n'
      + '            "emplCtrctDuration": null,\n'
      + '            "emplName": "Hộ KD Mai Thịnh Hưng",\n'
      + '            "emplCtrctFromYear": 0,\n'
      + '            "emplCtrctToYear": null,\n'
      + '            "emplAddress": "Số 8, căn 7, nhà N12 Binh Đoàn 11",\n'
      + '            "emplCountry": "VNM",\n'
      + '            "emplProvince": "Hà Nội",\n'
      + '            "emplDistrict": "019",\n'
      + '            "emplWard": "Trung Văn",\n'
      + '            "houseTypeOtherValue": null,\n'
      + '            "currentAddressYears": 5,\n'
      + '            "otherContactType": null,\n'
      + '            "otherContactValue": null,\n'
      + '            "referenceType1": "PS",\n'
      + '            "referenceName1": "Nguyễn Thị Lan",\n'
      + '            "referencePhone1": "0339303576",\n'
      + '            "referenceType2": "CP",\n'
      + '            "referenceName2": "E Huyền",\n'
      + '            "referencePhone2": "0899990285",\n'
      + '            "monthlyIncome": "800252184.000",\n'
      + '            "otherIncome": "20000000.000",\n'
      + '            "mHouseholdExpenses": "0.000",\n'
      + '            "phoneVerifiedTickBox": "N",\n'
      + '            "maillingAddress": "current",\n'
      + '            "phoneNumber1": "0943676688",\n'
      + '            "phoneNumber2": null,\n'
      + '            "phoneNumber3": "0000000000",\n'
      + '            "companyPhoneNumber": "0000000000",\n'
      + '            "bankAccount": "67686888888",\n'
      + '            "bankName": "ACB-NGÂN HÀNG TMCP Á CHÂU",\n'
      + '            "bankCity": "Hà Nội",\n'
      + '            "bankBranch": "CN HÀ NỘI",\n'
      + '            "bankCode": "01307001",\n'
      + '            "email": null,\n'
      + '            "createdDate": "2021-06-02T10:40:06.000Z",\n'
      + '            "updatedDate": "2021-06-04T11:06:35.000Z",\n'
      + '            "ownerId": "1",\n'
      + '            "kiotUseMonth": null,\n'
      + '            "countTrans": null\n'
      + '        }\n'
      + '    ]\n'
      + '}\n';

  res.json(JSON.parse(json));
});

router.post('/ui-service/collection/v1/payment-info', function(req, res, next) {
  var json = '{\n'
      + '\t"code": 0,\n'
      + '\t"message": "[LMS-ECL] success",\n'
      + '\t"data": {\n'
      + '\t\t"contract_number": "6000000239",\n'
      + '\t\t"contract_status_code": "ACT",\n'
      + '\t\t"dpdVas": 10,\n'
      + '\t\t"dpdStrategy": 10,\n'
      + '\t\t"totalDebt": 190000,\n'
      + '\t\t"printOverDue": 100000,\n'
      + '\t\t"intOverDue": 0,\n'
      + '\t\t"lpi": 20000,\n'
      + '\t\t"feeOverDue": 12000,\n'
      + '\t\t"prinOutstading": 2000000,\n'
      + '\t\t"nextDueDate": "2022-06-04",\n'
      + '\t\t"nextDuePaymentTotal": 4000000,\n'
      + '\t\t"totalPaymentInMonth": 0,\n'
      + '\t\t"lastPaymentDate": "2021-06-04 19:00:00",\n'
      + '\t\t"totalPayment": 4000000,\n'
      + '\t\t"statusContract": "WO",\n'
      + '\t\t"productName": "FIPO",\n'
      + '\t\t"annexAmt": null,\n'
      + '\t\t"bucketBom": "B1",\n'
      + '\t\t"bucketCurrent": "B1",\n'
      + '\t\t"emi": 200000\n'
      + '\t},\n'
      + '\t"lmsType": "ECL"\n'
      + '}';
  res.json(JSON.parse(json));
})

router.post('/ui-service/lms-cashloan/v1/termination/annex', function(req, res, next) {
  var json = '{\n'
      + '    "code": 200,\n'
      + '    "message": "Normal Termination with annex Id: 10073301",\n'
      + '    "data": {\n'
      + '        "insurAmt": 0,\n'
      + '        "priAmt": 3488000,\n'
      + '        "feeAmt": 36000,\n'
      + '        "intAmt": 43000,\n'
      + '        "lpiAmt": 67000,\n'
      + '        "penAmt": 0,\n'
      + '        "pri_amt": 3488000,\n'
      + '        "int_amt": 43000,\n'
      + '        "fee_amt": 36000,\n'
      + '        "nonAllocateAmt": 0,\n'
      + '        "totalAmt": 3634000,\n'
      + '        "total_debt_amt": 3634000\n'
      + '    }\n'
      + '}\n';
  res.json(JSON.parse(json));
});
module.exports = router;
