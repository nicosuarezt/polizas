sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/ValidateException",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "polizas/libs/Util",
    "polizas/libs/rolesPerfiles",
  ],
  function (
    Controller,
    JSONModel,
    ValidateException,
    Filter,
    FilterOperator,
    History,
    UIComponent,
    Util,
    rolesPerfiles
  ) {
    "use strict";
    var camposConPermiso = [];
    var camposConPermisoEnable = [];
    return Controller.extend(
      "polizas.controller.mainPolizas",
      {
        hanadb: "/hanadb",
        modelPolizas: "/mPolizas",
        tableNameView: "idPolizas",
        varPIuser: "",
        arr: [],
        cantPolizas: 0,
        //Roles y perfiles//
        modelPermissions: "/mPermissons",
        nameApp: "SCMPOLTRAY",
        onInit: function () {
        //   this.oModelMainPolicy =
        //     this.getOwnerComponent().getModel("mMainPolicy");
        //   this.getView().setModel(this.oModelMainPolicy);
        //   this.getRouter()
        //     .getRoute("mainPolizasNav")
            // .attachMatched(this.onRouteMatched, this);
        //   this.doSimpleSelect = Util.generateSelect(this.oModelPrestamos, true);
        //   this.doSimpleSelectColumns = Util.generateSelect(
        //     this.oModelPrestamos
        //   );
        //   this.loadUserInfo();
        //   this.getDataPolizas();
          // this.oModel = new JSONModel({
          // 	mPolizas: [],
          // 	mVisibleDelete: false,
          // 	mEnabledDelete: false
          // });
        //   this.getView().setModel(this.oModel);
        //   this.byId("idFleteInicial").setFilterType("");
        //   this.byId("idFleteInicialColumns").setFilterType(function (oValue) {
        //     return oValue.replace(/\./g, "");
        //   });
        //   this.byId("idFleteFinalColumns").setFilterType(function (oValue) {
        //     return oValue.replace(/\./g, "");
        //   });
        //   this.byId("idValorPolizaColumns").setFilterType(function (oValue) {
        //     return oValue.replace(/\./g, "");
        //   });
        },
        //RolesxElement
        getRouter: function () {
          return sap.ui.core.UIComponent.getRouterFor(this);
        },
        _getCore: function () {
          return sap.ui.getCore();
        },
        onRouteMatched: function (oEvent) {
          var oArguments = oEvent.getParameter("arguments");
          var idEdit = oArguments.idEdit;
          this.getDataPolizas();
        },
        loadUserInfo: function () {
          var that = this;
          var userModel = new sap.ui.model.json.JSONModel();
          userModel.attachRequestCompleted(function onCompleted(oEvent) {
            if (oEvent.getParameter("success")) {
              sap.ui.getCore().setModel(userModel, "userapi");
              that.varPIuser = this.getData();
            }
            that.onPrivileges();
          });
          userModel.loadData("/user/attributes", "", false);
        },
        onPrivileges: function () {
          let sEmailUser = this.varPIuser.email
            ? this.varPIuser.email
            : this.varPIuser.mail; // pq cambió el api en PRD
          let iIDRol = rolesPerfiles.getRol(sEmailUser);
          let arrConsult = rolesPerfiles.getDataRolesxElemento(
            iIDRol,
            this.nameApp,
            null,
            this
          );
          if (arrConsult.length === 0) {
            this.getView()
              .findElements(true)
              .forEach((element) => {
                if (element.setVisible) {
                  element.setVisible(false);
                }
              });
          }
          for (var i = 0; i < arrConsult.length; i++) {
            if (
              this.byId(arrConsult[i].id_elemento) !== null &&
              this.byId(arrConsult[i].id_elemento) !== undefined
            ) {
              var campoVisibleActual = this.byId(
                arrConsult[i].id_elemento
              ).getVisible();
              var visibleBDRoles = arrConsult[i].read;
              this.byId(arrConsult[i].id_elemento).setVisible(
                campoVisibleActual && visibleBDRoles
              );
              if (visibleBDRoles == false) {
                this.byId(arrConsult[i].id_elemento).setModel(null);
              } else if (arrConsult[i].read == true) {
                camposConPermiso.push(arrConsult[i].id_elemento);
              }
              if (arrConsult[i].toHaveEnebled) {
                var campoHabilitadoActual = this.byId(
                  arrConsult[i].id_elemento
                ).getEnabled();
                var habilitadoBDRoles = arrConsult[i].update;
                this.byId(arrConsult[i].id_elemento).setEnabled(
                  campoHabilitadoActual && habilitadoBDRoles
                );
                if (habilitadoBDRoles == true) {
                  camposConPermisoEnable.push(arrConsult[i].id_elemento);
                }
              }
            } else if (
              this._getCore().byId(arrConsult[i].id_elemento) !== null &&
              this._getCore().byId(arrConsult[i].id_elemento) !== undefined
            ) {
              var campoVisibleActual = this._getCore()
                .byId(arrConsult[i].id_elemento)
                .getVisible();
              var visibleBDRoles = arrConsult[i].read;
              this._getCore()
                .byId(arrConsult[i].id_elemento)
                .setVisible(campoVisibleActual && visibleBDRoles);
              if (arrConsult[i].read == true) {
                camposConPermiso.push(arrConsult[i].id_elemento);
              }
              if (
                this._getCore().byId(arrConsult[i].id_elemento).getEnabled !==
                undefined
              ) {
                var campoHabilitadoActual = this._getCore()
                  .byId(arrConsult[i].id_elemento)
                  .getEnabled();
                var habilitadoBDRoles = arrConsult[i].update;
                this._getCore()
                  .byId(arrConsult[i].id_elemento)
                  .setEnabled(campoHabilitadoActual && habilitadoBDRoles);
                if (habilitadoBDRoles == true) {
                  camposConPermisoEnable.push(arrConsult[i].id_elemento);
                }
              }
            }
          }
        },
        hasRights: function (idC, mdl) {
          if (mdl) {
            if (camposConPermiso.includes(idC)) {
              return true;
            }
          }
          return false;
        },
        hasEnableRights: function (idCampo, mdl) {
          if (mdl) {
            if (camposConPermisoEnable.includes(idCampo)) {
              return true;
            }
          }
          return false;
        },
        mostrarCampo: function (idCampo) {
          if (camposConPermiso.includes(idCampo)) {
            if (
              this.byId(idCampo) !== null &&
              this.byId(idCampo) !== undefined
            ) {
              this.byId(idCampo).setVisible(true);
            } else {
              this._getCore().byId(idCampo).setVisible(true);
            }
          }
        },
        habilitarCampo: function (idCampo) {
          if (camposConPermisoEnable.includes(idCampo)) {
            if (
              this.byId(idCampo) !== null &&
              this.byId(idCampo) !== undefined
            ) {
              this.byId(idCampo).setEnabled(true);
            } else {
              this._getCore().byId(idCampo).setEnabled(true);
            }
          }
        },
        handleRefresh: function (evt) {
          var oModel = this.getView().getModel();

          setTimeout(
            function () {
              this.byId("pullToRefresh").hide();
              this.getDataPolizas();
              oModel.refresh();
              //oModel.setProperty(this.modelPolizas, this.getDataPolizas());
            }.bind(this),
            900
          );
        },
        onPress: function (evt) {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("formAdd");
        },
        onDetails: function (evt) {
          var oModel = this.getView().getModel();
          var sPath = evt.getSource().getBindingContext().getPath();
          var oRowData = oModel.getProperty(sPath);
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("formEdit", {
            idEdit: oRowData.ID,
          });
        },
        _filter: function () {
          var oFilter = null;
          if (this._oTxtFilter) {
            oFilter = this._oTxtFilter;
          }
          this.byId(this.tableNameView)
            .getBinding("rows")
            .filter(oFilter, "Application");
        },
        onHandleTxtFilter: function (oEvent) {
          var oView = this.getView();
          oView.setModel(
            new JSONModel({
              filterValue: "",
            }),
            "ui"
          );
          this._oTxtFilter = null;
          var sQuery = oEvent ? oEvent.getParameter("query") : null;
          this._oTxtFilter = null;
          if (sQuery) {
            this._oTxtFilter = new Filter(
              [
                new Filter("NAME", FilterOperator.Contains, sQuery),
                new Filter("DESC1", FilterOperator.Contains, sQuery),
                new Filter("DESC3", FilterOperator.Contains, sQuery),
                new Filter("DESC4", FilterOperator.Contains, sQuery),
                new Filter("DESC6", FilterOperator.Contains, sQuery),
                new Filter("DESC12", FilterOperator.Contains, sQuery),
                new Filter("DESC19", FilterOperator.Contains, sQuery),
              ],
              false
            );
          }
          this.getView().getModel("ui").setProperty("/filterValue", sQuery);
          if (oEvent) {
            this._filter();
          }
        },
        onClearAllFilters: function () {
          this.onHandleTxtFilter();
          this._filter();
        },
        onDeletePoliza: function (oEvent) {
          var index = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .split("/")[2];
          if (
            this.oModelMainPolicy.getProperty("/mPolizas")[index].ID ===
            undefined
          ) {
            var refRemove = this.arr[index - this.cantPolizas];
            this.oModelMainPolicy.getProperty(this.modelPolizas).pop(refRemove);
          } else {
            Util.deleteDataBD(
              "POLIZAS_TRAYECTOS",
              '"id_poliza" = ' +
                this.defaultNumber(
                  this.oModelMainPolicy.getProperty("/mPolizas")[index].ID
                )
            );
            this.getDataPolizas();
          }
          this.oModelMainPolicy.setProperty(
            this.modelPolizas,
            this.oModelMainPolicy.getProperty(this.modelPolizas)
          );
        },
        getDataPolizas: function () {
          let sQuery =
            'SELECT  * FROM <tenant_schema>."POLIZAS_TRAYECTOS" order by "id_poliza" DESC';
          let arrData = this.doSimpleSelect(
            "str",
            24,
            sQuery,
            null,
            ``,
            false,
            true
          );
          this.oModelMainPolicy.setProperty(this.modelPolizas, arrData);
          this.cantPolizas = arrData.length;
          // var that = this;
          // var data1 = {
          // 	NameTable: "POLIZAS_TRAYECTOS",
          // 	ColumnQua: 24,
          // 	OrderBy: "id_poliza",
          // 	ColumnSelect: "*",
          // 	GroupBy: ""

          // };
          // var that = this;
          // var sql = 'SELECT  * FROM "SC_MTA_DB_2"."sc-mta-db::tables.POLIZAS_TRAYECTOS" order by "id_poliza" DESC';
          // var data1 = {
          // 	NameTable: "str",
          // 	ColumnQua: 24,
          // 	OrderBy: sql,
          // 	ColumnSelect: "",
          // 	GroupBy: ""
          // };
          // var datavalue = JSON.stringify(data1);
          // jQuery.ajax({
          // 	url: this.hanadb + "/xsjs/select.xsjs",
          // 	data: {
          // 		dataobject: datavalue
          // 	},
          // 	method: "GET",
          // 	success: function (data) {
          // 		if (data) {

          // 			// for (var i = 0; i < data.data.length; i++) {

          // 			// data.data[i].DESC14 = new Intl.NumberFormat("de-DE").format(data.data[i].DESC14);
          // 			// data.data[i].DESC15 = new Intl.NumberFormat("de-DE").format(data.data[i].DESC15);
          // 			// data.data[i].DESC18 = new Intl.NumberFormat("de-DE").format(data.data[i].DESC18);
          // 			// }

          // 			that.oModelMainPolicy.setProperty(that.modelPolizas, data.data);

          // 			that.cantPolizas = data.data.length;
          // 		}
          // 	},
          // 	error: function (err) {}
          // });
        },
        defaultNumber: function (numberValue) {
          var num = parseInt(numberValue, 10);
          return isNaN(num) ? null : num;
        },
      }
    );
  }
);
