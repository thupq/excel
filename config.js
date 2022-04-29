const {now} = require("moment");
var n = require('normalize-strings')
const dateFormat = require('dateformat');
const Excel = require("exceljs");
const fs = require("fs");
const path = require('path');
const moment = require('moment');
const evn = process.env.NODE_ENV || 'dev';
const dbconfig = require(`./config.${evn}`);
console.log(dbconfig);
const MAX_RECORD = 2000;

function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("SECRET_KEY", "12312312313");

function normalize(data) {
    let normal = String(n(data.trim()));
    return removeVietnameseTones(normal).replace(/ /gi, '_').toUpperCase();
}

function normalize2(data) {
    if (!data)
        return '';
    return data.trim();
}

function removeVietnameseTones(str) {
    // console.log(str)
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    return str;
}

function response(res, data, status, message) {
    if (status) {
        res.status(status);
    }
    res.json({
        data: data,
        status: status,
        message: message
    });
}

function audit(body, req, isUpdate) {
    if (!isUpdate) {
        body.created_time = now();
        body.created_by = req.user.email.email;
    }
    body.updated_time = now();
    body.updated_by = req.user.email.email;
}

function logInfo(error, req) {
    console.log(`info|request|${req ? req.currentTime: now()}|${error}`);
}

function logError(error, req) {
    console.error(`error|request|${req ? req.currentTime: now()}|${error}`);
    if(error['stack']) {
        console.error(error['stack']);
    }
}

function logDebug(error, req) {
    console.debug(`debug|request|${req ? req.currentTime: now()}|${error}`);
}

function convertDateToString(date, format) {
    if(!date) {
        return date;
    }
    // return new Promise (function (resolve,reject){
    //     try {
    //         resolve(dateFormat(date, format));
    //     } catch (error) {
    //         reject(error);
    //     }
    // });
    return dateFormat(date, format);
}

function readAllDataFromExcel(sheet, dtoImport) {
    let datas = [];
    for (let i = dtoImport.start_index; i <= sheet.lastRow.number; i++) {
        let row = sheet.getRow(i);
        let data = [];
        for (let c = 0; c < dtoImport.mapping.length; c++) {
            data[dtoImport.mapping[c].field] = normalize2(row.getCell(dtoImport.mapping[c].index).toString());
        }
        datas.push({
            row_index: i,
            ...data
        })
    }
    return datas;
}

function writeResultToExcel(sheet, datas, importDto) {
    let header = sheet.getRow(importDto.start_index-1);
    let headerCell = header.getCell(importDto.result.index);
    headerCell.value = 'Kết quả';
    writeCellHeaderStyle(headerCell);
    for(let i = 0; i < datas.length; i++) {
        let row = sheet.getRow(datas[i].row_index);
        row.getCell(importDto.result.index).value = datas[i].result;
    }
}

function writeCellHeaderStyle(cell) {
    cell.font = {
        name: 'Calibri (Body)',
        family: 2,
        bold: true,
        size: 11,
    };
    cell.alignment = {
        vertical: 'middle', horizontal: 'center'
    };
    cell.fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'C7C7C7'}
    };
    cell.border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
    };
}

function importExcel(req, res, readFlags, importDto, process) {
    try {
    let filePath = __dirname + '/resources/import/' + req.file.filename;
    let wb = new Excel.Workbook();
    wb.xlsx.readFile(filePath)
    .then(async () => {
        try {
            let sheet = wb.worksheets[0];
            logInfo('lastRow: ' + sheet.lastRow.number);
            if (sheet.lastRow.number < importDto.start_index) {
                response(res, null, 400, req.__('system.file.empty'));
                return;
            }

            if (sheet.lastRow.number - importDto.start_index > MAX_RECORD) {
                response(res, null, 400, req.__('system.file.max_record'));
                return;
            }

            let datas = readAllDataFromExcel(sheet, importDto);
            let flags = [];
            if(readFlags) {
                let row = sheet.getRow(importDto.start_index - 1);
                for (let c = 0; c < importDto.mapping.length; c++) {
                    // if (c === 0) {
                    //     flags.push({key: importDto.mapping[c].field, flag: 'N'});
                    // }
                    let cell = row.getCell(importDto.mapping[c].index).toString();
                    flags.push({key: importDto.mapping[c].field, flag: cell});
                }
            }

            let resultObj = {
                totalError: 0,
                total: datas.length
            }

            await process(datas,flags, resultObj);

            writeResultToExcel(sheet, datas, importDto);
            // console.log(datas);
            res.setHeader("total", resultObj.total);
            res.setHeader("totalError", resultObj.totalError);
            wb.xlsx.write(res);

        }catch (e) {
            logError(e, req);
        } finally {
            fs.unlinkSync(filePath);
        }
    });
    }catch (e) {
        logError(e, req);
        response(res, null, 400, req.__('system.error'));
    }
}

function writeRefer(sheet, datas, refer) {
    if(datas.length > 0) {
        for(let i = 0; i < datas.length; i++) {
            for(let c = 0; c < refer.fields.length; c++) {
                let row = sheet.getRow(refer.rowIndex + i);
                let cell = row.getCell(refer.colIndex+c);
                cell.value = datas[i][refer.fields[c].field];
            }
        }

    }
}

function exportExcel(req, res, datas, importDto, pathFile) {
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
        'Content-Disposition',
        'attachment; filename=loai_danh_muc.xlsx'
    );

    /** read all data **/
    const wb = new Excel.Workbook();
    wb.xlsx.readFile(__dirname + pathFile)
    .then(() => {
        let sheet = wb.worksheets[0];
        let i = 0;
        let startIndex = importDto.start_index;
        for (; i < datas.length; i++) {
            let data = datas[i];
            let fields = [];
            fields.push(i+1);
            for(let c = 0; c < importDto.export_field.length; c++) {
                fields.push(data[importDto.export_field[c]]);
            }
            sheet.insertRow(startIndex + i, fields);
        }
        wb.xlsx.write(res);
    })
    .catch(error => {
        console.error(error);
    });
}

function clone(x) {
    return JSON.parse(JSON.stringify(x));
}

function isDate(d, format) {
    if(moment(d, format).isValid()) {   
        return true;
    }
    try {
        return !isNaN(Date.parse(d));
    }catch (e) {
        return false;
    }
}

function getDateImport(date, format_before, format_after){
    if(date.length < 10 || !isDate(date, format_before)) return undefined;
    if(date.length === 10) return moment(date, format_before).format(format_after);
    return moment(date).format(format_after);
}

function checkPattern(d, pattern) {
    return pattern.test(d);
}

function isLessThan(from, to) {
    if(!to) {
        return true;
    }
    let fromDate = moment(from, 'DD/MM/YYYY');
    let toDate = moment(to, 'DD/MM/YYYY');
    return fromDate.isBefore(toDate);

}

function findField(field, import_dto) {
    return import_dto.mapping.find(x => x.field === field);
}

function updateFlags(entity, data, flags, import_dto) {
    console.log(flags);
    for(let i = 0; i < flags.length; i++) {
        if((flags[i].flag === 'Y' && !import_dto.mapping[i].required) ||
            import_dto.mapping[i].required
        ) {
            console.log(import_dto.mapping[i].field);
            if(import_dto.mapping[i].field.endsWith('_str')) {
                let field = import_dto.mapping[i].field.substring(0, import_dto.mapping[i].field.length - 4);
                entity[field] = data[field];
                console.log('field_str', field);
            } else {
                entity[import_dto.mapping[i].field] = data[import_dto.mapping[i].field];
            }
        }
    }
}

module.exports = {
    findField: findField,
    updateFlags: updateFlags,
    checkPattern: checkPattern,
    isDate: isDate,
    getDateImport: getDateImport,
    clone: clone,
    normalize2: normalize2,
    normalize: normalize,
    logInfo: logInfo,
    logError: logError,
    logDebug: logDebug,
    audit: audit,
    response: response,
    convertDateToString: convertDateToString,
    readAllDataFromExcel: readAllDataFromExcel,
    writeResultToExcel: writeResultToExcel,
    importExcel: importExcel,
    writeRefer: writeRefer,
    exportExcel: exportExcel,
    isLessThan: isLessThan,
    db: {
        host: dbconfig.db.host,
        port: dbconfig.db.port,
        username: dbconfig.db.username,
        password: dbconfig.db.password,
        dbName: dbconfig.db.dbName
    },
    jwtSecretKey: '12312312313',

    httpStatus: {
        success: 200,
        created: 201,
        notfound: 404,
        badRequest: 400
    },
    active: {
        true: 1,
        false: 0
    },
    activeStr: {
        true: '1',
        false: '0'
    },
    staff_template: {
        personal_info: 1,
        certificate: 2,
        experience: 3,
        relative: 4
    },
    reward_and_discipline_template: {
        reward_template: 1,
        discipline_template: 2
    },
    DICT_TYPE_NAME: {
        QUOC_GIA: "Quốc gia",
        DAN_TOC: "Dân tộc",
        TON_GIAO: "Tôn giáo",
        TRINH_DO_HOC_VAN: "Trình độ học vấn",
        TRINH_DO_CHUYEN_MON: 'Trình độ chuyên môn',
        PHUONG_XA: "Phường/Xã",
        THANH_PHO: "Tỉnh/Thành phố",
        QUAN_HUYEN: "Quận/Huyện",
        NGANH: "Ngành",
        CHUYEN_NGANH: "Chuyên ngành",
        RELATION: "Loại quan hệ",
        CONTRACT_TYPE: "Loại hợp đồng",
        NGACH: 'Ngạch',
        CAP_BAC: 'Cấp bậc',
        VI_TRI_CONG_VIEC: 'Vị trí công việc',
        CHUC_DANH: 'Chức danh',
        BIEN_DONG: 'Biến động',
        NHOM_LY_DO_BIEN_DONG: 'Nhóm lý do biến động',
        LY_DO_BIEN_DONG_CHI_TIET: 'Lý do biến động chi tiết',
        XEP_LOAI_BANG_CAP: 'Xếp loại bằng cấp',
        LOAI_KHEN_THUONG: 'Loại khen thưởng',
        HINH_THUC_KY_LUAT: 'Hình thức kỷ luật'
    },
    DICT_ITEM_NAME: {
        BIEN_DONG_ANH_HUONG_QTCT: 'Biến động ảnh hưởng quá trình công tác',
        NGHI_VIEC: 'Nghỉ việc',
        KHAU_TRU_THU_NHAP: 'Khấu trừ thu nhập',
    },
    dict_type_import_mode: {
        on: 1, //cho lan dau tien
        off: 0
    },
    current_import_mode: 0,
    sequence: {
        staff_certificates_id_seq: 'staff_certificates_id_seq',
        staff_experiences_id_seq: 'staff_experiences_id_seq',
        staff_relatives_id_seq: 'staff_relatives_id_seq',
        dict_type_id_seq: 'dict_types_id_seq',
        dict_items_id_seq: 'dict_items_id_seq',
        staff_contracts_id_seq: 'staff_contracts_id_seq',
        staff_contracts_no_seq: 'staff_contracts_no_seq',
        core_positions_id_seq: 'core_position_id_seq',
        stategic_staffing_id_seq: 'stategic_staffing_id_seq',
        core_departments_id_seq: 'core_departments_id_seq',
        staff_positions_id_seq: 'staff_positions_id_seq',
        core_staff_id_seq: 'core_staff_id_seq',
        reward_and_discipline_id_seq: 'reward_and_discipline_id_seq'
    },
    classification: [
        {label: 'Xuất sắc', index: 1},
        {label: 'Giỏi', index: 2},
        {label: 'Khá', index: 3},
        {label: 'Trung bình', index: 4},
    ],
    cert_type: [
        {label: 'Bằng cấp', index: 1},
        {label: 'Chứng chỉ', index: 2}
    ],
    form_of_reward: [
        {label: 'Tiền mặt', index: 1},
        {label: 'Hiện vật', index: 2},
        {label: 'Tiền mặt & hiện vật', index: 3},
        {label: 'Khác', index: 4},
    ],
    salary_status: [
        {label: 'Cùng kỳ lương', index: 1},
        {label: 'Ngoài kỳ lương', index: 2},
    ],
    date_format: {
        dd_mm_yyyy: 'DD-MM-YYYY',
        dd_mm_yyyy2: 'DD/MM/YYYY',
        yyyy_mm_dd: "YYYY-MM-DD",
        mm_dd_yyyy: "MM/DD/YYYY"
    },
    is_dependant: [
        {label: 'Không', index: 0},
        {label: 'Có', index: 1}
    ],
    gender: [
        {label: 'Nam', index: 1},
        {label: 'Nữ', index: 2}
    ],
    marital_status: [
        {label: 'độc thân', index: 1},
        {label: 'đã kết hôn', index: 2},
        {label: 'khác', index: 3}
    ],
    pattern: {
        effect_month: /((0[1-9]|1[0-2])\/[0-9]\d{3})/,
        decimal: /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/,
        dd_mm_yyyy: /^\d{2}\/\d{2}\/\d{4}$/,
        name_search: /^((([a-vxyỳọáầảấờễàạằệếýộậốũứĩõúữịỗìềểẩớặòùồợãụủíỹắẫựỉỏừỷởóéửỵẳẹèẽổẵẻỡơôưăêâđ]+)|(\s)){1,})$/,
        code_search: /^[a-z0-9_]{1,}$/
    },
    prefix_system_code: {
        staff: "NV_",
        certificate: "CERT_",
        experiences: "EXP_",
        relative: "REL_",
        dict_type: "M_",
        dict_item: "IT_",
        contract: "CT_",
        core_positions: 'CP_',
        stategic_staffing: 'SS_',
        core_departments: 'CD_',
        staff_positions: 'SPO_',
        reward_and_discipline: 'RAD_'
    }


}
