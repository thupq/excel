var indexRouter = require('./index.route');
var dictTypeRouter = require('./dict_types.route');
var staffCertificatesRouter = require('./staff_certificates.route');
var staffExperiencesRouter = require('./staff_experiences.route');
var staffRelativesRouter = require('./staff_relatives.route');
var loginRouter = require('./login.route');
var staffManagementRoutes = require('./staff-management.route');
var departmentRoutes = require('./department.route');
var staffContractsRoutes = require('./staff-contracts.route');
var namingSystemRouter = require('./core_positions.route');
var strategicStaffingRouter = require('./strategic-staffing.route');
var organizationalStructureRouter = require('./organizational-structure.route');
var staffPositionsRoutes = require('./staff-positions.route');
var rewardAndDisciplineRoutes = require('./reward_and_discipline.route');
var studentRoutes = require('./student.route');

var auth = require('../middleware/auth.middleware')
module.exports = function(app) {
  app.use('/', indexRouter);
  app.use("/auth", loginRouter);

  //all api after auth must be have token
  app.all("*", auth);
  app.use('/api', dictTypeRouter);
  app.use('/api', staffCertificatesRouter);
  app.use('/api', staffExperiencesRouter);
  app.use('/api', staffRelativesRouter);
  app.use('/api', staffManagementRoutes);
  app.use('/api', departmentRoutes);
  app.use('/api', staffContractsRoutes);
  app.use('/api', namingSystemRouter);
  app.use('/api', strategicStaffingRouter);
  app.use('/api', organizationalStructureRouter);
  app.use('/api', staffPositionsRoutes);
  app.use('/api', rewardAndDisciplineRoutes);
  app.use('/api', studentRoutes);
}
