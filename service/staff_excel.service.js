const db = require("../config/database-config");
var fs = require('fs');
let config = require('../config');
const Excel = require('exceljs');
const path = require('path');
const staff_import_dto = require('../model/dto/staff_import.dto')
const staff_certificate_dto = require('../model/dto/staff_certificate_import.dto')
const staff_relative_dto = require('../model/dto/staff_relative_import.dto')
const staff_experience_dto = require('../model/dto/staff_experience_import.dto')
var staffService = require('../service/staff.service');
const {now} = require("moment");
const moment = require("moment");
let staffRepo = require('../model/repositories/staff.custom');
let dictItemRepo = require('../model/repositories/dict_items.custom');
let dictTypeRepo = require('../model/repositories/dict_types.custom');
let staffCertRepo = require('../model/repositories/staff_certificates.custom');
let staffExpRepo = require('../model/repositories/staff_experiences.custom');
let staffRelateRepo = require('../model/repositories/staff_relatives.custom');

function getTemplatePath(type) {
    switch (type) {
        case config.staff_template.personal_info:
            return {
                path: '/templates/thong_tin_ca_nhan.xlsx',
                result: 'thong_tin_ca_nhan_result.xlsx'
            };
        case config.staff_template.certificate:
            return {
                path: '/templates/bang_cap_chung_chi.xlsx',
                result: 'bang_cap_chung_chi_result.xlsx'
            };
        case config.staff_template.experience:
            return {
                path: '/templates/kinh_nghiem_lam_viec.xlsx',
                result: 'kinh_nghiem_lam_viec_result.xlsx'
            };
        case config.staff_template.relative:
            return {
                path: '/templates/danh_sach_nhan_than.xlsx',
                result: 'danh_sach_nhan_than_result.xlsx'
            };
    }
}

async function exportTemplate(req, res) {
    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = getTemplatePath(body.type);
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + path2.result
    );

    wb.xlsx.readFile(path.dirname(__dirname) + path2.path)
        .then(async () => {

            /** add reference **/
            switch (body.type) {
                case config.staff_template.personal_info:
                    await referPersonalInforTemplate(req, res, wb);
                    break;
                case config.staff_template.certificate:
                    await referCertificateTemplate(req, res, wb);
                    break;
                case config.staff_template.experience:
                    await referExperienceTemplate(req, res, wb);
                    break;
                case config.staff_template.relative:
                    await referRelativeTemplate(req, res, wb);
                    break;
            }
            wb.xlsx.write(res);
        })
        .catch(error => {
            console.error(error);
            config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
        });


}

async function referPersonalInforTemplate(req, res, wb) {
    let city = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.THANH_PHO, null);
    let district = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUAN_HUYEN, null);
    let ward = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.PHUONG_XA, null);

    let cities = [];
    let districts = [];
    let wards = [];
    if (!!city && city.length > 0) {
        cities = await dictItemRepo.findByDictTypeId(city[0].id, null);
    }
    if (!!district && district.length > 0) {
        districts = await dictItemRepo.findByDictTypeId(district[0].id, null);
    }
    if (!!ward && ward.length > 0) {
        wards = await dictItemRepo.findByDictTypeId(ward[0].id, null);
    }
    let sheet = wb.worksheets[1];

    config.writeRefer(sheet, cities, staff_import_dto.staff_refer.city);
    config.writeRefer(sheet, districts, staff_import_dto.staff_refer.district);
    config.writeRefer(sheet, wards, staff_import_dto.staff_refer.ward);


}

async function referCertificateTemplate(req, res, wb) {
    let carer = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGANH, null);
    let specialized = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUYEN_NGANH, null);
    let classification = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.XEP_LOAI_BANG_CAP, null);

    let carers = [];
    let specializeds = [];
    let classifications = [];
    if (!!carer && carer.length > 0) {
        carers = await dictItemRepo.findByDictTypeId(carer[0].id, null);
    }
    if (!!specialized && carer.length > 0) {
        specializeds = await dictItemRepo.findByDictTypeId(specialized[0].id, null);
    }
    if (!!classification && classification.length > 0) {
      classifications = await dictItemRepo.findByDictTypeId(classification[0].id, null);
  }
    let sheet = wb.worksheets[1];

    config.writeRefer(sheet, carers, staff_certificate_dto.cer_refer.carer);
    config.writeRefer(sheet, specializeds, staff_certificate_dto.cer_refer.specialized);
    config.writeRefer(sheet, classifications, staff_certificate_dto.cer_refer.classification);
}

function referExperienceTemplate(req, res, wb) {

}

async function referRelativeTemplate(req, res, wb) {
    let city = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.THANH_PHO, null);
    let district = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUAN_HUYEN, null);
    let ward = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.PHUONG_XA, null);

    let cities = [];
    let districts = [];
    let wards = [];
    if (!!city && city.length > 0) {
        cities = await dictItemRepo.findByDictTypeId(city[0].id, null);
    }
    if (!!district && district.length > 0) {
        districts = await dictItemRepo.findByDictTypeId(district[0].id, null);
    }
    if (!!ward && ward.length > 0) {
        wards = await dictItemRepo.findByDictTypeId(ward[0].id, null);
    }
    let sheet = wb.worksheets[1];

    config.writeRefer(sheet, cities, staff_relative_dto.relative_refer.city);
    config.writeRefer(sheet, districts, staff_relative_dto.relative_refer.district);
    config.writeRefer(sheet, wards, staff_relative_dto.relative_refer.ward);
}


async function importTemplate(req, res) {
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
        'Content-Disposition',
        'attachment; filename=noi_dung_danh_muc.xlsx'
    );
    const body = req.body;
    switch (Number(body.type)) {
        case config.staff_template.personal_info:
            return importPersonalInfoTemplate(req, res);
        case config.staff_template.certificate:
            return importCertificateTemplate(req, res);
        case config.staff_template.experience:
            return importExperienceTemplate(req, res);
        case config.staff_template.relative:
            return importRelativeTemplate(req, res);
    }
}

/**
 * Import infomation personal
 * @param {*} req 
 * @param {*} res 
 */
async function importPersonalInfoTemplate(req, res) {
    config.importExcel(req, res, true, staff_import_dto, async (datas, flags, resultObj) => {
        let created = [];
        let updated = [];

        // Get list dict items for national, bla...
        let national = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUOC_GIA, null);
        let province = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.THANH_PHO, null);
        let district = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUAN_HUYEN, null);
        let village = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.PHUONG_XA, null);
        let nationality = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUOC_GIA, null);
        let ethnic = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.DAN_TOC, null);
        let religion = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.TON_GIAO, null);
        let graduated = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.TRINH_DO_CHUYEN_MON, null);

        let nationals = [];
        let provinces = [];
        let districts = [];
        let villages = [];
        let nationalities = [];
        let ethnics = [];
        let religions = [];
        let graduateds = [];
        if(!!national && national.length > 0) {
            nationals = await dictItemRepo.findByDictTypeId(national[0].id, null);
        }
        if(!!province && province.length > 0) {
            provinces = await dictItemRepo.findByDictTypeId(province[0].id, null);
        }
        if(!!district && district.length > 0) {
            districts = await dictItemRepo.findByDictTypeId(district[0].id, null);
        }
        if(!!village && village.length > 0) {
            villages = await dictItemRepo.findByDictTypeId(village[0].id, null);
        }
        if(!!nationality && nationality.length > 0) {
            nationalities = await dictItemRepo.findByDictTypeId(nationality[0].id, null);
        }
        if(!!ethnic && ethnic.length > 0) {
            ethnics = await dictItemRepo.findByDictTypeId(ethnic[0].id, null);
        }
        if(!!religion && religion.length > 0) {
            religions = await dictItemRepo.findByDictTypeId(religion[0].id, null);
        }
        if(!!graduated && graduated.length > 0) {
            graduateds = await dictItemRepo.findByDictTypeId(graduated[0].id, null);
        }

        const checkAddress = (national_name, province_name, district_name, village_name) => {
            let national_obj = undefined;
            let province_obj = undefined;
            let district_obj = undefined;

            const returnError = message => ({
                status: 'error',
                message
            })

            // nation
            if(!!national_name) {
                const nationInput = nationals.find(x => x.dict_name.toLowerCase() === national_name.toLowerCase());
                if(!nationInput) 
                    return returnError('nation.not_found');
                else national_obj = nationInput;
            } else 
                return returnError('nation.empty');

            // province
            if(!!province_name) {
                // find province in nation
                const provincesInNation = provinces.filter(x => x.parent_id === national_obj.id);
                if(!!provincesInNation && provincesInNation.length > 0) {
                    // determine province by name
                    const provinceInput = provincesInNation.find(x => x.dict_name.toLowerCase() === province_name.toLowerCase())
                    if(!provinceInput) 
                        return returnError('province.not_found');
                    else province_obj = provinceInput;
                } else 
                    return returnError('province.not_found');
            } else 
                return returnError('province.empty');

            // district
            if(!!district_name) {
                // find district in province
                const districtsInProvince = districts.filter(x => x.parent_id === province_obj.id);
                if(!!districtsInProvince && districtsInProvince.length > 0) {
                    // determine district by name
                    const districtInput = districtsInProvince.find(x => x.dict_name.toLowerCase() === district_name.toLowerCase())
                    if(!districtInput) 
                        return returnError('district.not_found');
                    else district_obj = districtInput;
                } else 
                    return returnError('district.not_found');
            } else 
                return returnError('district.empty');

            // village
            if(!!village_name) {
                // find village in district
                const villagesInDistrict = villages.filter(x => x.parent_id === district_obj.id);
                if(!!villagesInDistrict && villagesInDistrict.length > 0) {
                    // determine village by name
                    const villageInput = villagesInDistrict.find(x => x.dict_name.toLowerCase() === village_name.toLowerCase())
                    if(!villageInput) 
                        return returnError('village.not_found');
                    else return {
                            status: 'success',
                            village_id: villageInput.id
                        }
                } else 
                    return returnError('village.not_found');
            } else 
                return returnError('village.empty');
        }

        for(let i = 0; i < datas.length; i++) {
            let data = datas[i];

            // staff_code
            if(!!data.staff_id){
                let existed = await staffRepo.findByStaffId(data.staff_id);
                if(existed.length > 0) {
                    data.id = existed[0].id;
                    data.created_time = existed[0].created_time;
                    data.created_by = existed[0].created_by;
                } else {
                    data.result = req.__('import_staff.staff_id.not_found');
                    resultObj.totalError++;
                    continue;
                }
            }

            // name
            if(!data.name) {
                data.result = req.__('import_staff.name.empty');
                resultObj.totalError++;
                continue;
            }
            if (!!data.name && data.name.length > 100) {
              data.result = req.__('import_staff.name.max_length');
              resultObj.totalError++;
              continue;
            }

            // date_of_employment
            if(!!data.date_of_employment) {
                const date_of_employment = config.getDateImport(data.date_of_employment, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!date_of_employment) {
                    data.result = req.__('import_staff.date_of_employment.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.date_of_employment = date_of_employment;
            } else {
                data.result = req.__('import_staff.date_of_employment.empty');
                resultObj.totalError++;
                continue;
            }

            // date_of_birth
            if(!!data.date_of_birth) {
                const date_of_birth = config.getDateImport(data.date_of_birth, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!date_of_birth) {
                    data.result = req.__('import_staff.date_of_birth.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.date_of_birth = date_of_birth;
            } else {
                data.result = req.__('import_staff.date_of_birth.empty');
                resultObj.totalError++;
                continue;
            }

            // gender
            if(!!data.gender) {
                const gender = config.gender.find(element => element.label.toLowerCase() == data.gender.toLowerCase());
                if(!!gender) {
                    data.gender = gender.index;
                } else {
                    data.result = req.__('import_staff.gender.invalid');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('import_staff.gender.empty');
                resultObj.totalError++;
                continue;
            }

            // marital_status
            if(!!data.marital_status) {
                const marital_status = config.marital_status.find(element => element.label.toLowerCase() == data.marital_status.toLowerCase());
                if(!!marital_status) {
                    data.marital_status = marital_status.index;
                } else {
                    data.result = req.__('import_staff.marital_status.invalid');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('import_staff.marital_status.empty');
                resultObj.totalError++;
                continue;
            }

            // citizen_id_no
            if(!data.citizen_id_no) {
                data.result = req.__('import_staff.citizen_id_no.empty');
                resultObj.totalError++;
                continue;
            }
            if (!!data.citizen_id_no && data.citizen_id_no.toString().length > 100) {
              data.result = req.__('import_staff.citizen_id_no.max_length');
                resultObj.totalError++;
                continue;
            }
            
            // date_of_issue
            if(!!data.date_of_issue) {
                const date_of_issue = config.getDateImport(data.date_of_issue, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!date_of_issue) {
                    data.result = req.__('import_staff.date_of_issue.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.date_of_issue = date_of_issue;
            } else {
                data.result = req.__('import_staff.date_of_issue.empty');
                resultObj.totalError++;
                continue;
            }

            // place_of_issue
            if(!data.place_of_issue) {
                data.result = req.__('import_staff.place_of_issue.empty');
                resultObj.totalError++;
                continue;
            }

            // nationality
            if(!!data.nationality) {
                const nationalInput = nationalities.find(x => x.dict_name.toLowerCase() === data.nationality.toLowerCase());
                if(!nationalInput) {
                    data.result = req.__('import_staff.nationality.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.nationality = nationalInput.id;
                }
            } else {
                data.result = req.__('import_staff.nationality.empty');
                resultObj.totalError++;
                continue;
            }

            // ethnic
            if(!!data.ethnic) {
                const ethnicInput = ethnics.find(x => x.dict_name.toLowerCase() === data.ethnic.toLowerCase());
                if(!ethnicInput) {
                    data.result = req.__('import_staff.ethnic.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.ethnic = ethnicInput.id;
                }
            } else {
                data.result = req.__('import_staff.ethnic.empty');
                resultObj.totalError++;
                continue;
            }

            // religion
            if(!!data.religion) {
                const religionInput = religions.find(x => x.dict_name.toLowerCase() === data.religion.toLowerCase());
                if(!religionInput) {
                    data.result = req.__('import_staff.religion.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.religion = religionInput.id;
                }
            } else {
                data.result = req.__('import_staff.religion.empty');
                resultObj.totalError++;
                continue;
            }

            // graduated
            if(!!data.graduated) {
                const graduatedInput = graduateds.find(x => x.dict_name.toLowerCase() === data.graduated.toLowerCase());
                if(!graduatedInput) {
                    data.result = req.__('import_staff.graduated.not_found');
                    resultObj.totalError++;
                    continue;
                } else {
                    data.graduated = graduatedInput.id;
                }
            } else {
                data.result = req.__('import_staff.graduated.empty');
                resultObj.totalError++;
                continue;
            }

            // business_email
            if(!data.business_email) {
                data.result = req.__('import_staff.business_email.empty');
                resultObj.totalError++;
                continue;
            }
            if(!!data.business_email && data.business_email.length > 100) {
              data.result = req.__('import_staff.business_email.max_length');
              resultObj.totalError++;
              continue;
          }

            // private_email
            if(!data.private_email) {
                data.result = req.__('import_staff.private_email.empty');
                resultObj.totalError++;
                continue;
            } 
            if(!!data.private_email && data.private_email.length > 100) {
              data.result = req.__('import_staff.private_email.max_length');
              resultObj.totalError++;
              continue;
          } 

            // mobile_phone
            if(!data.mobile_phone) {
                data.result = req.__('import_staff.mobile_phone.empty');
                resultObj.totalError++;
                continue;
            }
            if(!!data.mobile_phone && data.mobile_phone.length > 50) {
              data.result = req.__('import_staff.mobile_phone.max_length');
              resultObj.totalError++;
              continue;
            }

            // ext
            if(!!data.ext && data.ext.length > 50) {
              data.result = req.__('import_staff.ext.max_length');
              resultObj.totalError++;
              continue;
            }

            // contact_for_emergency
            if(!!data.contact_for_emergency && data.contact_for_emergency.length > 100) {
              data.result = req.__('import_staff.contact_for_emergency.max_length');
              resultObj.totalError++;
              continue;
            }

            // emergency_contact_address
            if(!!data.emergency_contact_address && data.emergency_contact_address.length > 200) {
              data.result = req.__('import_staff.emergency_contact_address.max_length');
              resultObj.totalError++;
              continue;
            }

            // permanent_address_detail
            if(!!data.permanent_address_detail && data.permanent_address_detail.length > 100) {
              data.result = req.__('import_staff.permanent_address_detail.max_length');
              resultObj.totalError++;
              continue;
            }

            // contact_address_detail
            if(!!data.contact_address_detail && data.contact_address_detail.length > 100) {
              data.result = req.__('import_staff.contact_address_detail.max_length');
              resultObj.totalError++;
              continue;
            }

            // pit_tax_code
            if(!!data.pit_tax_code && data.pit_tax_code.length > 50) {
              data.result = req.__('import_staff.pit_tax_code.max_length');
              resultObj.totalError++;
              continue;
            }

            // social_insurance_cod
            if(!!data.social_insurance_cod && data.social_insurance_cod.length > 50) {
              data.result = req.__('import_staff.social_insurance_cod.max_length');
              resultObj.totalError++;
              continue;
            }

            // work_permit_no
            if(!!data.work_permit_no && data.work_permit_no.length > 100) {
              data.result = req.__('import_staff.work_permit_no.max_length');
              resultObj.totalError++;
              continue;
            }

            // emergency_contact_number
            if(!!data.emergency_contact_number && data.emergency_contact_number.length > 50) {
              data.result = req.__('import_staff.emergency_contact_number.max_length');
              resultObj.totalError++;
              continue;
            }

             // health_check_book_no
             if(!!data.health_check_book_no && data.health_check_book_no.length > 50) {
              data.result = req.__('import_staff.health_check_book_no.max_length');
              resultObj.totalError++;
              continue;
            }

            // work_permit_title
            if(!!data.work_permit_title && data.work_permit_title.length > 100) {
              data.result = req.__('import_staff.work_permit_title.max_length');
              resultObj.totalError++;
              continue;
            }

            // check country of origin address
            const countryCheckAddress = await checkAddress(
                data.country_of_origin_nation, 
                data.country_of_origin_province, 
                data.country_of_origin_district, 
                data.country_of_origin_village
            );

            if(countryCheckAddress.status == 'error') {
                data.result = req.__('import_staff.country_of_origin_' + countryCheckAddress.message);
                resultObj.totalError++;
                continue;
            } else {
                data.country_of_origin = countryCheckAddress.village_id;
            }

            // check permanent address
            const permanentCheckAddress = await checkAddress(
                data.permanent_address_nation,
                data.permanent_address_province,
                data.permanent_address_district,
                data.permanent_address_village
            );

            if(permanentCheckAddress.status == 'error') {
                data.result = req.__('import_staff.permanent_address_' + countryCheckAddress.message);
                resultObj.totalError++;
                continue;
            } else {
                data.permanent_address = permanentCheckAddress.village_id;
            }

            // check contact address
            const contactCheckAddress = await checkAddress(
                data.contact_address_nation,
                data.contact_address_province,
                data.contact_address_district,
                data.contact_address_village
            );

            if(contactCheckAddress.status == 'error') {
                data.result = req.__('import_staff.contact_address_' + contactCheckAddress.message);
                resultObj.totalError++;
                continue;
            } else {
                data.contact_address = contactCheckAddress.village_id;
            }

            // work_permit_start_date
            if(!!data.work_permit_start_date) {
                const work_permit_start_date = config.getDateImport(data.work_permit_start_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!work_permit_start_date) {
                    data.result = req.__('import_staff.work_permit_start_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.work_permit_start_date = work_permit_start_date;
            } else {
                data.work_permit_start_date = null
            }

            // work_permit_end_date
            if(!!data.work_permit_end_date) {
                if (!data.work_permit_start_date) {
                    data.result = req.__('import_staff.work_permit_end_date.invalid_start_date');
                    resultObj.totalError++;
                    continue;
                }
                const work_permit_end_date = config.getDateImport(data.work_permit_end_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!work_permit_end_date) {
                    data.result = req.__('import_staff.work_permit_end_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.work_permit_end_date = work_permit_end_date;

                if(moment(data.work_permit_start_date).isSameOrAfter(moment(data.work_permit_end_date))) {
                    data.result = req.__('import_staff.work_permit_end_date.lass_then');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.work_permit_end_date = null
            }

            let entity = config.clone(data);
            if(entity.staff_id) {
                config.audit(entity, req, true);
                updated.push(entity);
            } else {
                let id = await db.getNextSequence(config.sequence.core_staff_id_seq);
                entity.id = id;
                entity.staff_id = config.prefix_system_code.staff + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
            entity.is_active = config.active.true;
        }

        if (created.length > 0) {
            try {
                await db.db.Staffs.bulkCreate(
                    created,
                    {
                        fields: staff_import_dto.fields,
                        updateOnDuplicate: staff_import_dto.update_key
                    }
                )
            } catch (error) {
                console.error(error);
                config.response(res, null, config.httpStatus.badRequest, req.__('import_staff.create.failed'));
            }
        }

        if (updated.length > 0) {
            for (let entity of updated) {
                try {
                    await db.db.Staffs.upsert(entity);
                } catch (error) {
                    datas.every((data, index) => {
                        if(data.id == entity.id) {
                            datas[index].result = req.__('import_staff.update.failed');
                            resultObj.totalError++;
                            return false;
                        }
                        return true;
                    })
                    continue;
                }
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    })
}

function importCertificateTemplate(req, res) {
    config.importExcel(req, res, true, staff_certificate_dto, async (datas, flags, resultObj) => {
        let created = [];
        let updated = [];

        // lấy ra danh sách ngành, chuyên ngành, xếp loại,
        let majorTypeId = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGANH, null);
        let specialistTypeId = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUYEN_NGANH, null);
        let classificationTypeId = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.XEP_LOAI_BANG_CAP, null);
        let majorList = [];
        let specialistList = [];
        let classificationList = [];
        if(!!majorTypeId && majorTypeId.length > 0) {
          majorList = await dictItemRepo.findByDictTypeId(majorTypeId[0].id, null);
        }
        if(!!specialistTypeId && specialistTypeId.length > 0) {
          specialistList = await dictItemRepo.findByDictTypeId(specialistTypeId[0].id, null);
        }
        if(!!classificationTypeId && classificationTypeId.length > 0) {
          classificationList = await dictItemRepo.findByDictTypeId(classificationTypeId[0].id, null);
        }

        const checkMappingMajorSpecialist = (major, specialist) => {
          let major_obj = undefined;
          let specialist_obj = undefined;
          const returnError = message => ({
              status: 'error',
              message
          })

          // major
          if(!!major) {
              const majorInput = majorList.find(x => x.dict_name.toLowerCase() === major.toLowerCase());
              if(!majorInput) {
                return returnError('import_staff.certificates.major.not_found');
              } else {
                major_obj = majorInput;
              }
          } else 
              return returnError('import_staff.certificates.major.empty');

          // specialist
          if(!!specialist) {
              // find specialist in major
              const specialistInMajor = specialistList.filter(x => x.parent_id === major_obj.id);
              if(!!specialistInMajor && specialistInMajor.length > 0) {
                  // determine province by name
                  const specialistInput = specialistInMajor.find(x => x.dict_name.toLowerCase() === specialist.toLowerCase())
                  if(!specialistInput) 
                      return returnError('import_staff.certificates.specialist.not_found');
                  else specialist_obj = specialistInput;
              } else 
                  return returnError('import_staff.certificates.specialist.not_found');
          } else 
              return returnError('import_staff.certificates.specialist.empty');

              return {
                status: 'success',
                major: major_obj.id,
                specialist: specialist_obj.id,
            }
        } 

        const checkClassification = (classification) => {
          let classification_obj = undefined;
          const returnError = message => ({
            status: 'error',
            message
          })
           // classification
          if(!!classification) {
            const classificationInput = classificationList.find(x => x.dict_name.toLowerCase() === classification.toLowerCase());
            console.log('classificationInput:::', classificationInput)
            if(!classificationInput) {
              return returnError('import_staff.certificates.classification.not_found');
            } else {
              classification_obj = classificationInput
            }
          } else 
              return returnError('import_staff.certificates.classification.empty');
              return {
                status: 'success',
                classification: classification_obj.id,
            }
        }

        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];

            let staff = null;
            if (data.staff_code) {
                staff = await staffRepo.findByStaffId(data.staff_code);
                if (staff.length === 0) {
                    data.result = req.__('cert.staff_id.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('cert.staff_id.empty');
                resultObj.totalError++;
                continue;
            }

            let entity = config.clone(data);

            if (data.type) {
                let type = config.cert_type.find(x => x.label.toLowerCase() === data.type.toLowerCase());
                if (type) {
                    entity.type = type.index;
                }
            } else {
                data.result = req.__('cert.type.empty');
                resultObj.totalError++;
                continue;
            }
            
            // type
            if (entity.type !== 1 && entity.type !== 2) {
              data.result = req.__('import_staff.certificates.type.not_found');
              resultObj.totalError++;
              continue;
            }

            if (entity.type === 1) {
                //bang cap

                // training_place
                if(!data.training_place) {
                  data.result = req.__('import_staff.training_place.empty');
                  resultObj.totalError++;
                  continue;
                }
                if (!!data.training_place && data.training_place.length > 200) {
                  data.result = req.__('import_staff.certificates.training_place.max_length');
                  resultObj.totalError++;
                  continue;
                }

                //major && specialist
                const checkMajorAndSpecialist = await checkMappingMajorSpecialist(data.major, data.specialist)
                if (checkMajorAndSpecialist && checkMajorAndSpecialist.status === 'error') {
                  data.result = req.__(checkMajorAndSpecialist.message);
                  resultObj.totalError++;
                  continue;
                }
                entity.major = checkMajorAndSpecialist.major;
                entity.specialist = checkMajorAndSpecialist.specialist;

                // classification
                if (data.classification) {
                  const isClassification = await checkClassification(data.classification);
                  if (isClassification && isClassification.status === 'error') {
                    data.result = req.__(isClassification.message);
                    resultObj.totalError++;
                    continue;
                  } else {
                    entity.classification = isClassification.classification;
                    console.log('data.classification::', data.classification)
                  }
                } else {
                  data.result = req.__('import_staff.certificates.classification.empty');
                  resultObj.totalError++;
                  continue;
                }
                if (data.graduation_date) {
                    const graduation_date = config.getDateImport(data.graduation_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                    if(!graduation_date) {
                        data.result = req.__('cert.graduation_date.invalid_format');
                        resultObj.totalError++;
                        continue;
                    }
                    entity.graduation_date = graduation_date;
                } else {
                  entity.graduation_date = null;
                }

                entity.certificate = null;
                entity.date_of_issue = null;
                entity.expired_date = null;
            } else {
                //chung chi

                // certificate
                if (!data.certificate) {
                    data.result = req.__('cert.certificate.empty');
                    resultObj.totalError++;
                    continue;
                }
                if (!!data.certificate && data.certificate.length > 200) {
                  data.result = req.__('import_staff.certificates.certificate.max_length');
                  resultObj.totalError++;
                  continue;
                }

                // date_of_issue
                if (data.date_of_issue) {
                    const date_of_issue = config.getDateImport(data.date_of_issue, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                    if(!date_of_issue) {
                        data.result = req.__('cert.date_of_issue.invalid_format');
                        resultObj.totalError++;
                        continue;
                    }
                    entity.date_of_issue = date_of_issue;
                } else {
                    data.result = req.__('cert.date_of_issue.empty');
                    resultObj.totalError++;
                    continue;
                }

                 // expired_date
                if (data.expired_date) {
                    const expired_date = config.getDateImport(data.expired_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                    if(!expired_date) {
                        data.result = req.__('cert.expired_date.invalid_format');
                        resultObj.totalError++;
                        continue;
                    }
                    entity.expired_date = expired_date;

                    if(!moment(entity.date_of_issue).isBefore(moment(entity.expired_date))) {
                        data.result = req.__('cert.expired_date.less_than');
                        resultObj.totalError++;
                        continue;
                    }
                } else {
                  entity.expired_date = null;
                }
                entity.classification = null;
                entity.major = null;
                entity.specialist = null;
                entity.graduation_date = null;
            }

            entity.is_active = config.active.true;

            if (data.system_code) {
                //update
                let cert = await staffCertRepo.findBySystemCode(data.system_code);
                if (cert.length === 0) {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                    continue;
                }

                entity.id = cert[0].id;
                entity.staff_id = cert[0].staff_id;
                entity.system_code = cert[0].system_code;
                entity.created_time = cert[0].created_time;
                entity.created_by = cert[0].created_by;
                /** update by flags **/
                config.updateFlags(cert[0], entity, flags, staff_certificate_dto);
                config.audit(cert[0], req, true);
                updated.push(cert[0]);
            } else {
                let id = await db.getNextSequence(config.sequence.staff_certificates_id_seq);
                // entity = config.clone(data);
                entity.id = id;
                entity.staff_id = staff[0].id;
                entity.system_code = config.prefix_system_code.certificate + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
        }

        if (created.length > 0) {
            await db.db.StaffCertificates.bulkCreate(
                created,
                {
                    fields: staff_certificate_dto.fields,
                    updateOnDuplicate: staff_certificate_dto.update_key
                }
            )
        }

        if (updated.length > 0) {
            for (let entity of updated) {
                await db.db.StaffCertificates.upsert(entity);
            }
        }
        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });

    });
}

function importExperienceTemplate(req, res) {
    config.importExcel(req, res, true, staff_experience_dto, async (datas, flags, resultObj) => {

        let created = [];
        let updated = [];
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];

            if (data.staff_code) {
                let staff = await staffRepo.findByStaffId(data.staff_code);
                if (staff.length > 0) {
                    data.staff_id = staff[0].id;
                } else {
                    data.result = req.__('cert.staff_id.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('cert.staff_id.empty');
                resultObj.totalError++;
                continue;
            }

            if (data.start_date) {
                const start_date = config.getDateImport(data.start_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!start_date) {
                    data.result = req.__('exp.start_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.start_date = start_date;
            } else {
                data.result = req.__('cert.start_date.empty');
                resultObj.totalError++;
                continue;
            }

            if (data.end_date) {
                const end_date = config.getDateImport(data.end_date, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!end_date) {
                    data.result = req.__('exp.end_date.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.end_date = end_date;
                    
                if(!moment(data.start_date).isBefore(moment(data.end_date))) {
                    data.result = req.__('exp.end_date.less_than');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('cert.end_date.empty');
                resultObj.totalError++;
                continue;
            }

            if (!data.company) {
                data.result = req.__('exp.company.empty');
                resultObj.totalError++;
                continue;
            }

            if (!data.position) {
                data.result = req.__('exp.position.empty');
                resultObj.totalError++;
                continue;
            }

            let entity = config.clone(data);
            if (data.system_code) {
                let existed = await staffExpRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.staff_id = existed[0].staff_id;
                    entity.created_by = existed[0].created_by;
                    entity.created_time = existed[0].created_time;

                    /** update by flags **/
                    config.updateFlags(existed[0], entity, flags, staff_experience_dto);
                    config.audit(existed[0], req, true);
                    updated.push(existed[0]);
                } else {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.staff_experiences_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.experiences + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
            entity.is_active = config.active.true;


        }

        if (created.length > 0) {
            await db.db.StaffExperiences.bulkCreate(
                created,
                {
                    fields: staff_experience_dto.fields,
                    updateOnDuplicate: staff_experience_dto.update_key
                }
            )
        }
        if (updated.length > 0) {
            for (const entity of updated) {
                await db.db.StaffExperiences.upsert(entity);
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    });
}

function importRelativeTemplate(req, res) {
    config.importExcel(req, res, true, staff_relative_dto, async (datas, flags, resultObj) => {

        let created = [];
        let updated = [];
        // console.log(datas);
        let national = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUOC_GIA, null);
        let city = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.THANH_PHO, null);
        let district = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUAN_HUYEN, null);
        let ward = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.PHUONG_XA, null);
        let relation = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.RELATION, null);
        let nationals = [];
        let cities = [];
        let districts = [];
        let wards = [];
        let relations = [];
        if (!!national && national.length > 0) {
            nationals = await dictItemRepo.findByDictTypeId(national[0].id, null);
        }
        if (!!city && city.length > 0) {
            cities = await dictItemRepo.findByDictTypeId(city[0].id, null);
        }
        if (!!district && district.length > 0) {
            districts = await dictItemRepo.findByDictTypeId(district[0].id, null);
        }
        if (!!ward && ward.length > 0) {
            wards = await dictItemRepo.findByDictTypeId(ward[0].id, null);
        }
        if (!!relation && relation.length > 0) {
            relations = await dictItemRepo.findByDictTypeId(relation[0].id, null);
        }

        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];
            if (data.staff_code) {
                let staff = await staffRepo.findByStaffId(data.staff_code);
                if (staff.length > 0) {
                    data.staff_id = staff[0].id;
                } else {
                    data.result = req.__('cert.staff_id.not_found');
                    resultObj.totalError++;
                    continue;
                }
            } else {
                data.result = req.__('cert.staff_id.empty');
                resultObj.totalError++;
                continue;
            }

            /** ten ng than **/
            if (!data.name) {
                data.result = req.__('relate.name.empty');
                resultObj.totalError++;
                continue;
            }

            /** ngay sinh **/
            if (data.date_of_birth) {
                const date_of_birth = config.getDateImport(data.date_of_birth, config.date_format.dd_mm_yyyy2, config.date_format.mm_dd_yyyy);
                if(!date_of_birth) {
                    data.result = req.__('relate.date_of_birth.invalid_format');
                    resultObj.totalError++;
                    continue;
                }
                data.date_of_birth = date_of_birth;
            } else {
                data.result = req.__('relate.date_of_birth.empty');
                resultObj.totalError++;
                continue;
            }

            /** moi quan he **/
            if (!data.relation_str) {
                data.result = req.__('relate.relation.empty');
                resultObj.totalError++;
                continue;
            } else {
                let relate = relations.find(x => x.dict_name.toLowerCase() === data.relation_str.toLowerCase());
                if (relate) {
                    data.relation = relate.id;
                } else {
                    data.result = req.__('relate.relation.not_found');
                    resultObj.totalError++;
                }
            }
            /** la nguoi phu thuoc **/
            if (data.is_dependant_str) {
                let c = config.is_dependant.find(x => x.label.toLowerCase() === data.is_dependant_str.toLowerCase());
                if (c) {
                    data.is_dependant = c.index;
                } else {
                    data.result = req.__('relate.is_dependant.not_found');
                    resultObj.totalError++;
                }
            } else {
                data.result = req.__('relate.is_dependant.empty');
                resultObj.totalError++;
            }

            /** gender **/
            if (data.gender_str) {
                let c = config.gender.find(x => x.label.toLowerCase() === data.gender_str.toLowerCase());
                if (c) {
                    data.gender = c.index;
                } else {
                    data.result = req.__('relate.gender_str.not_found');
                    resultObj.totalError++;
                }
            } else {
                data.result = req.__('relate.gender_str.empty');
                resultObj.totalError++;
            }

            /** kiem tra quoc gia **/
            if (data.nationality_str) {
                let c = nationals.find(x => x.dict_name.toLowerCase() === data.nationality_str.toLowerCase());
                if (c) {
                    data.nationality = c.id;
                } else {
                    data.result = req.__('relate.nationality_str.not_found');
                    resultObj.totalError++;
                }
            } else {
                data.result = req.__('relate.nationality_str.empty');
                resultObj.totalError++;
            }

            if (data.ward_str) {
                let c = wards.find(x => x.dict_name.toLowerCase() === data.ward_str.toLowerCase());
                if (c) {
                    data.ward = c.id;
                    data.place_of_residence = c.id;
                } else {
                    data.result = req.__('relate.ward_str.not_found');
                    resultObj.totalError++;
                }
            } else {
                data.result = req.__('relate.ward_str.empty');
                resultObj.totalError++;
            }

            /** ngay hieu luc **/
            if (data.effective_month) {
                if (!config.checkPattern(data.effective_month, config.pattern.effect_month)) {
                    data.result = req.__('relate.effective_month.format');
                    resultObj.totalError++;
                }
            } else {
                data.result = req.__('relate.effective_month.empty');
                resultObj.totalError++;
            }
            /** ngay het han **/
            if (data.expired_month) {
                if (!config.checkPattern(data.expired_month, config.pattern.effect_month)) {
                    data.result = req.__('relate.expired_month.format');
                    resultObj.totalError++;
                }
            } else {
                data.result = req.__('relate.expired_month.empty');
                resultObj.totalError++;
            }

            let entity = config.clone(data);
            if (data.system_code) {
                let existed = await staffRelateRepo.findBySystemCode(data.system_code);
                if (existed.length > 0) {
                    entity.id = existed[0].id;
                    entity.system_code = existed[0].system_code;
                    entity.created_time = existed[0].created_time;
                    entity.created_by = existed[0].created_by;

                    /** update by flags **/
                    config.updateFlags(existed[0], entity, flags, staff_relative_dto);
                    config.audit(existed[0], req, true);
                    updated.push(existed[0]);
                } else {
                    data.result = req.__('cert.not_found');
                    resultObj.totalError++;
                }
            } else {
                let id = await db.getNextSequence(config.sequence.staff_relatives_id_seq);
                entity.id = id;
                entity.system_code = config.prefix_system_code.relative + id;
                config.audit(entity, req, false);
                created.push(entity);
            }
            entity.is_active = config.active.true;
        }

        if (created.length > 0) {
            await db.db.StaffRelatives.bulkCreate(
                created,
                {
                    fields: staff_relative_dto.fields,
                    updateOnDuplicate: staff_relative_dto.update_key
                }
            )
        }
        if (updated.length > 0) {
            for (const entity of updated) {
                await db.db.StaffRelatives.upsert(entity);
            }
        }

        datas.forEach(data => {
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    });
}

async function exportData(req, res) {

    const body = req.body;
    const wb = new Excel.Workbook();
    const path2 = getTemplatePath(body.type);
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + path2.result
    );

    wb.xlsx.readFile(path.dirname(__dirname) + path2.path)
        .then(async () => {

            /** add reference **/
            switch (body.type) {
                case config.staff_template.personal_info:
                    await exportStaff(req, res, wb);
                    break;
                case config.staff_template.certificate:
                    await exportCertificate(req, res, wb);
                    break;
                case config.staff_template.experience:
                    await exportExperience(req, res, wb);
                    break;
                case config.staff_template.relative:
                    await exportRelative(req, res, wb);
                    break;
            }
            wb.xlsx.write(res);
        })
        .catch(error => {
            console.error(error);
            config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
        });


}

async function searchStaff(req) {
    const searchObj = {
        name: req.body['name'] ? req.body['name'] : req.query['name'],
        staffId: req.body['staffId'] ? req.body['staffId'] : req.query['staffId'],
        departmentId: req.body['departmentId'] ? req.body['departmentId'] : req.query['departmentId'],
        positionCateId: req.body['positionCateId'] ? req.body['positionCateId'] : req.query['positionCateId'],
        positionItemId: req.body['positionItemId'] ? req.body['positionItemId'] : req.query['positionItemId'],
        page: req.body['page'] ? req.body['page'] : req.query['page'],
        size: req.body['size'] ? req.body['size'] : req.query['size'],
        getAll: req.body['getAll'] ? req.body['getAll'] : req.query['getAll'],
    }
    return await staffRepo.searchAll(searchObj, false, searchObj.getAll);
}

async function exportStaff(req, res, wb) {
    /** read all data **/
    let datas = [];
    let categoryIds = req.body.list_category_id;
    req.query['getAll'] = true;
    if (categoryIds && categoryIds.length === 0) {
        datas = await searchStaff(req);
    } else {
        datas = await searchStaff(req);
        datas = datas.filter(e => categoryIds.includes(e.id));
    }


    let sheet = wb.worksheets[0];
    let i = 0;
    let startIndex = staff_import_dto.start_index;
    let ethnic = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.DAN_TOC, null);
    let religion = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.TON_GIAO, null);
    let national = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUOC_GIA, null);
    let city = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.THANH_PHO, null);
    let district = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUAN_HUYEN, null);
    let ward = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.PHUONG_XA, null);
    let relation = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.RELATION, null);
    let grand = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.TRINH_DO_CHUYEN_MON, null);
    let nationals = [];
    let cities = [];
    let districts = [];
    let wards = [];
    let relations = [];
    let ethnics = [];
    let religions = [];
    let grands = [];
    if (!!national && national.length > 0) {
        nationals = await dictItemRepo.findByDictTypeId(national[0].id, null);
    }
    if (!!city && city.length > 0) {
        cities = await dictItemRepo.findByDictTypeId(city[0].id, null);
    }
    if (!!district && district.length > 0) {
        districts = await dictItemRepo.findByDictTypeId(district[0].id, null);
    }
    if (!!ward && ward.length > 0) {
        wards = await dictItemRepo.findByDictTypeId(ward[0].id, null);
    }
    if (!!relation && relation.length > 0) {
        relations = await dictItemRepo.findByDictTypeId(relation[0].id, null);
    }
    if (!!ethnic && ethnic.length > 0) {
        ethnics = await dictItemRepo.findByDictTypeId(ethnic[0].id, null);
    }
    if (!!religion && religion.length > 0) {
        religions = await dictItemRepo.findByDictTypeId(religion[0].id, null);
    }
    if (!!grand && grand.length > 0) {
        grands = await dictItemRepo.findByDictTypeId(grand[0].id, null);
    }

    datas.forEach(data => {
        if (data['country_of_origin']) {
            let c = wards.find(x => x.id == data['country_of_origin']);
            if (c) {
                data['country_of_origin_village'] = c.dict_name;
                let d = districts.find(x => x.id == c.parent_id);
                if (d) {
                    data['country_of_origin_district'] = d.dict_name;
                    let e = cities.find(x => x.id == d.parent_id);
                    if (e) {
                        data['country_of_origin_province'] = e.dict_name;
                        let f = nationals.find(x => x.id == e.parent_id);
                        if (f) {
                            data['country_of_origin_nation'] = f.dict_name;
                        }
                    }
                }
            }
        }
        if (data['contact_address']) {
            let c = wards.find(x => x.id == data['contact_address']);
            if (c) {
                data['contact_address_village'] = c.dict_name;
                let d = districts.find(x => x.id == c.parent_id);
                if (d) {
                    data['contact_address_district'] = d.dict_name;
                    let e = cities.find(x => x.id == d.parent_id);
                    if (e) {
                        data['contact_address_province'] = e.dict_name;
                        let f = nationals.find(x => x.id == e.parent_id);
                        if (f) {
                            data['contact_address_nation'] = f.dict_name;
                        }
                    }
                }
            }
        }
        if (data['permanent_address']) {
            let c = wards.find(x => x.id == data['permanent_address']);
            if (c) {
                data['permanent_address_village'] = c.dict_name;
                let d = districts.find(x => x.id == c.parent_id);
                if (d) {
                    data['permanent_address_district'] = d.dict_name;
                    let e = cities.find(x => x.id == d.parent_id);
                    if (e) {
                        data['permanent_address_province'] = e.dict_name;
                        let f = nationals.find(x => x.id == e.parent_id);
                        if (f) {
                            data['permanent_address_nation'] = f.dict_name;
                        }
                    }
                }
            }
        }
        if (data['nationality']) {
            let c = nationals.find(x => x.id == data['nationality']);
            data['nationality'] = c ? c.dict_name : null;
        }
        if (data['ethnic']) {
            let c = ethnics.find(x => x.id == data['ethnic']);
            data['ethnic'] = c ? c.dict_name : null;
        }
        if (data['religion']) {
            let c = religions.find(x => x.id == data['religion']);
            data['religion'] = c ? c.dict_name : null;
        }
        if (data['graduated']) {
            let c = grands.find(x => x.id == data['graduated']);
            data['graduated'] = c ? c.dict_name : null;
        }
    })

    for (; i < datas.length; i++) {
        let data = datas[i];
        const listData = [i + 1]
        const keys = [
            'staff_id',
            'name',
            'date_of_employment',
            'date_of_birth',
            'gender',
            'marital_status',
            'citizen_id_no',
            'date_of_issue',
            'place_of_issue',
            'nationality',
            'ethnic',
            'religion',
            'graduated',
            'business_email',
            'private_email',
            'mobile_phone',
            'ext',
            'country_of_origin_nation',
            'country_of_origin_province',
            'country_of_origin_district',
            'country_of_origin_village',
            'permanent_address_nation',
            'permanent_address_province',
            'permanent_address_district',
            'permanent_address_village',
            'permanent_address_detail',
            'contact_address_nation',
            'contact_address_province',
            'contact_address_district',
            'contact_address_village',
            'contact_address_detail',
            'pit_tax_code',
            'social_insurance_cod',
            'health_check_book_no',
            'work_permit_no',
            'work_permit_title',
            'work_permit_start_date',
            'work_permit_end_date',
            'contact_for_emergency',
            'emergency_contact_address',
            'emergency_contact_number'
        ];
        for (const key of keys) {
            if (key === 'marital_status' && data.marital_status) {
                let c = config.marital_status.find(x => x.index == data.marital_status);
                if (c) {
                    data[key] = c.label;
                }
            } else if (key === 'gender' && data.gender) {
                let c = config.gender.find(x => x.index == data.gender);
                if (c) {
                    data[key] = c.label;
                }
            } else if (['date_of_employment',
                'date_of_birth', 'date_of_issue', 'work_permit_start_date', 'work_permit_end_date'].includes(key)) {

                if (!moment(data[key], 'DD-MM-YYYY').isValid()) {
                    data[key] = null;
                    //TODO: Lỗi ngày
                } else {
                    data[key] = moment(data[key]).format('DD/MM/YYYY');
                }

            }
            listData.push(data[key]);

            // switch (key) {
            //     case 'date_of_employment' :
            //         listData.push(moment(data[key]).format("MM/DD/YYYY"));
            //         break;
            //     case 'date_of_birth' :
            //         listData.push(moment(data[key]).format("MM/DD/YYYY"));
            //         break;
            //     default:
            //         listData.push(data[key]);
            // }

        }
        sheet.insertRow(startIndex + i, listData);
    }
}

async function exportCertificate(req, res, wb) {
    let categoryId = req.body.list_category_id;
    if (categoryId.length === 0) {
        const allStaff = await searchStaff(req);
        categoryId = allStaff.map(x => x.id);
    }
    // console.log(categoryId);
    let datas = await staffCertRepo.findAllByListCategoryId(categoryId);

    let major = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.NGANH, null);
    let specialist = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.CHUYEN_NGANH, null);
    let classification = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.XEP_LOAI_BANG_CAP, null);
    let specialists = [];
    let majors = [];
    let classifications = [];
    if (!!specialist && specialist.length > 0) {
        specialists = await dictItemRepo.findByDictTypeId(specialist[0].id, null);
    }
    if (!!major && major.length > 0) {
        majors = await dictItemRepo.findByDictTypeId(major[0].id, null);
    }
    if (!!classification && classification.length > 0) {
      classifications = await dictItemRepo.findByDictTypeId(classification[0].id, null);
  }

    let index = 1;
    let sheet = wb.worksheets[0];
    let startIndex = staff_certificate_dto.start_index;
    for (let data of datas) {
        if (data.major) {
            let c = majors.find(x => x.id === Number(data.major));
            if (c) {
                data.major = c.dict_name;
            }
        }
        if (data.specialist) {
            let c = specialists.find(x => x.id === Number(data.specialist));
            if (c) {
                data.specialist = c.dict_name;
            }
        }
        if (data.classification) {
            let c = classifications.find(x => x.id === Number(data.classification));
            if (c) {
                data.classification = c.dict_name;
            }
        }
        if (data.certificate) {
            data.type = 'Chứng chỉ'
        } else {
          data.type = 'Bằng cấp'
        }

        if (data.graduation_date) {
            data.graduation_date = convertDate(data.graduation_date);
        }
        if (data.date_of_issue) {
            data.date_of_issue = convertDate(data.date_of_issue);
        }
        if (data.expired_date) {
            data.expired_date = convertDate(data.expired_date);
        }

        let insert = [index];
        for (let c = 1; c < staff_certificate_dto.mapping.length; c++) {
            insert.push(data[staff_certificate_dto.mapping[c].field]);
        }
        sheet.insertRow(startIndex + index - 1, insert);
        index++;

    }
}

function convertDate(data) {
    return moment(data).format("DD/MM/YYYY")
}

async function exportExperience(req, res, wb) {
    let categoryId = req.body.list_category_id;
    if (categoryId.length === 0) {
        const allStaff = await searchStaff(req);
        categoryId = allStaff.map(x => x.id);
    }
    // console.log(categoryId);

    let index = 1;
    let sheet = wb.worksheets[0];
    let startIndex = staff_experience_dto.start_index;
    let datas = await staffExpRepo.findAllByListCategoryId(categoryId);
    for (let data of datas) {
        if (data.start_date) {
            data.start_date = convertDate(data.start_date);
        }
        if (data.end_date) {
            data.end_date = convertDate(data.end_date);
        }

        let insert = [index];
        for (let c = 1; c < staff_experience_dto.mapping.length; c++) {
            insert.push(data[staff_experience_dto.mapping[c].field]);
        }
        sheet.insertRow(startIndex + index - 1, insert);
        index++;

    }
}

async function exportRelative(req, res, wb) {
    let categoryId = req.body.list_category_id;
    if (categoryId.length === 0) {
        const allStaff = await searchStaff(req);
        categoryId = allStaff.map(x => x.id);
    }
    // console.log(categoryId);

    let national = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUOC_GIA, null);
    let city = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.THANH_PHO, null);
    let district = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.QUAN_HUYEN, null);
    let ward = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.PHUONG_XA, null);
    let relation = await dictTypeRepo.findByDictTypeNameExactly(config.DICT_TYPE_NAME.RELATION, null);
    let nationals = [];
    let cities = [];
    let districts = [];
    let wards = [];
    let relations = [];
    if (!!national && national.length > 0) {
        nationals = await dictItemRepo.findByDictTypeId(national[0].id, null);
    }
    if (!!city && city.length > 0) {
        cities = await dictItemRepo.findByDictTypeId(city[0].id, null);
    }
    if (!!district && district.length > 0) {
        districts = await dictItemRepo.findByDictTypeId(district[0].id, null);
    }
    if (!!ward && ward.length > 0) {
        wards = await dictItemRepo.findByDictTypeId(ward[0].id, null);
    }
    if (!!relation && relation.length > 0) {
        relations = await dictItemRepo.findByDictTypeId(relation[0].id, null);
    }

    let index = 1;
    let sheet = wb.worksheets[0];
    let startIndex = staff_relative_dto.start_index;
    let datas = await staffRelateRepo.findAllByListCategoryId(categoryId);
    for (let data of datas) {
        if (data.date_of_birth) {
            data.date_of_birth = convertDate(data.date_of_birth);
        }

        if (data.relation) {
            let c = relations.find(x => x.id == data.relation);
            if (c) {
                data.relation_str = c.dict_name;
            }
        }

        if (data.place_of_residence) {
            let c = wards.find(x => x.id == data.place_of_residence);
            if (c) {
                data.ward_str = c.dict_name;
                let d = districts.find(x => x.id == c.parent_id);
                if (d) {
                    data.district_str = d.dict_name;
                    let e = cities.find(x => x.id == d.parent_id);
                    if (e) {
                        data.province_str = e.dict_name;
                        let f = nationals.find(x => x.id == e.parent_id);
                        if (f) {
                            data.nationality_str = f.dict_name;
                        }
                    }
                }
            }
        }

        if (data.gender) {
            let c = config.gender.find(x => x.index == data.gender);
            if (c) {
                data.gender_str = c.label;
            }
        }

        if (data.is_dependant) {
            let c = config.is_dependant.find(x => x.index == data.is_dependant);
            if (c) {
                data.is_dependant_str = c.label;
            }
        }

        // if(data.effective_month) {
        //     data.effective_month = convertDate2(data.effective_month);
        // }
        // if(data.expired_month) {
        //     data.expired_month = convertDate2(data.expired_month);
        // }

        let insert = [index];
        for (let c = 1; c < staff_relative_dto.mapping.length; c++) {
            insert.push(data[staff_relative_dto.mapping[c].field]);
        }
        sheet.insertRow(startIndex + index - 1, insert);
        index++;

    }
}

module.exports = {
    exportTemplate: exportTemplate,
    importTemplate: importTemplate,
    exportData: exportData
}
