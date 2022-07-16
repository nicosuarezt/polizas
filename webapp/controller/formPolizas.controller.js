sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"polizas/libs/Util",
	"polizas/libs/rolesPerfiles"
], function (Controller, Fragment, JSONModel, SimpleType, ValidateException, Filter, FilterOperator, History, UIComponent, Util, rolesPerfiles) {
	"use strict";
	var camposConPermiso=[];
	var camposConPermisoEnable=[];
	return Controller.extend("polizas.controller.formPolizas", {
		hanadb: "/hanadb",
		modelSegmentos: "/mSegmentos",
		modelProductos: "/mProductos",
		modelCiudades: "/mCiudades",
		modelPoseedores: "/mPoseedores",
		modelClientes: "/mClientes",
		modelDivisionPolitica: "/mDivisionPolitica",
		modelPolizas: "/mPolizas",
		tableDivisionPolitica: "DIVISION_POLITICA",
		idPoliza: "",
		varPIuser: "",
		varInputCiudad: "",
		DataEdit: [],
		nameApp: "SCMPOLTRAY",
		onInit: function () {
			// this.getDataSegmentos();
			// this.getProductos();
			// this.getDataDivisionPoliticaDB();
			this.oModel = new JSONModel({
				oAppConfig: {
					bEditMode: true,
					bReqMode: true
				},
				mSegmentos: [],
				mProductos: [],
				mClientes: [],
				mPoseedores: [],
				mPolizas: []
			});
			this.getView().setModel(this.oModel);
			// this.getRouter().getRoute("formEdit").attachMatched(this.onRouteMatched, this);
			// this.byId("btnUpdate").setVisible(false);
			// this.byId("idButtonEdit").setVisible(false);
			// this.blockInput();
			// this.loadUserInfo();
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		blockInput: function () {
			var that = this;
			var aInputs = ["idModalidad", "idTipoViaje", "idCodPoseedor", "idTipoCobro"];
			aInputs.forEach(function (element) {
				var idInput = that.byId(element);
				idInput.addEventDelegate({
					onAfterRendering: function () {
						idInput.$().find("INPUT").attr("readonly", true).css("color", "dark");
					}
				}, idInput);
			});
		},
		onRouteMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			var idEdit = oArguments.idEdit;
			this.byId("id_poliza").setValue(idEdit);
			this.mostrarCampo("idButtonEdit");
			this.getDataPolizasEdit(this.defaultNumber(idEdit));
			this.fillDataEdit(this.DataEdit[0]);
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
			let sEmailUser = this.varPIuser.email?this.varPIuser.email:this.varPIuser.mail; // pq cambió el api en PRD
			let iIDRol = rolesPerfiles.getRol(sEmailUser);
			let arrConsult = rolesPerfiles.getDataRolesxElemento(iIDRol, this.nameApp,null,this);
			if(arrConsult.length===0){
				this.getView().findElements(true).forEach((element)=>{
					if(element.setVisible){
						element.setVisible(false);
					}
				});
			}
			for (var i = 0; i < arrConsult.length; i++) {
				if (this.byId(arrConsult[i].id_elemento) !== null && this.byId(arrConsult[i].id_elemento) !== undefined) {
					var campoVisibleActual = this.byId(arrConsult[i].id_elemento).getVisible();
					var visibleBDRoles = arrConsult[i].read;
					this.byId(arrConsult[i].id_elemento).setVisible(campoVisibleActual&&visibleBDRoles);
					if(visibleBDRoles==false){
						this.byId(arrConsult[i].id_elemento).setModel(null);
					}else if(arrConsult[i].read==true){
						camposConPermiso.push(arrConsult[i].id_elemento);
					}
					if (arrConsult[i].toHaveEnebled) {
						var campoHabilitadoActual = this.byId(arrConsult[i].id_elemento).getEnabled();
						var habilitadoBDRoles = arrConsult[i].update;
						this.byId(arrConsult[i].id_elemento).setEnabled(campoHabilitadoActual&&habilitadoBDRoles);
						if (habilitadoBDRoles == true) {
							camposConPermisoEnable.push(arrConsult[i].id_elemento);
						}
					}
				}
				else if (this._getCore().byId(arrConsult[i].id_elemento) !== null && this._getCore().byId(arrConsult[i].id_elemento) !== undefined) {
					var campoVisibleActual = this._getCore().byId(arrConsult[i].id_elemento).getVisible();
					var visibleBDRoles = arrConsult[i].read;
					this._getCore().byId(arrConsult[i].id_elemento).setVisible(campoVisibleActual&&visibleBDRoles);
					if(arrConsult[i].read==true){
						camposConPermiso.push(arrConsult[i].id_elemento);
					}
					if (this._getCore().byId(arrConsult[i].id_elemento).getEnabled!==undefined) {
						var campoHabilitadoActual = this._getCore().byId(arrConsult[i].id_elemento).getEnabled();
						var habilitadoBDRoles = arrConsult[i].update;
						this._getCore().byId(arrConsult[i].id_elemento).setEnabled(campoHabilitadoActual&&habilitadoBDRoles);
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
				if(this.byId(idCampo)!==null && this.byId(idCampo)!==undefined){
					this.byId(idCampo).setVisible(true);
				}
				else{
					this._getCore().byId(idCampo).setVisible(true);
				}
			}
		},
		habilitarCampo: function (idCampo) {
			if (camposConPermisoEnable.includes(idCampo)) {
				if(this.byId(idCampo)!==null && this.byId(idCampo)!==undefined){
					this.byId(idCampo).setEnabled(true);
				}
				else{
					this._getCore().byId(idCampo).setEnabled(true);
				}
			}
		},
		_getCore: function () {
			return sap.ui.getCore();
		},
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.restartFieldsMenu();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("mainPolizasNav");
		},
		onPress: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("formAdd");
		},
		onDetails: function (oEvent) {
			var oModel = this.getView().getModel();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oRowData = oModel.getProperty(sPath);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("formEdit", {
				idEdit: oRowData.ID
			});
		},
		onEdit: function () {
			this.onEnabled();
			this.byId("idTipoViaje").setBlocked(false);
			this.mostrarCampo("btnUpdate");
			this.mostrarCampo("btnCancel");
		},
		onCancel: function () {
			this.fillDataEdit(this.DataEdit[0]);
		},
		onEnabled: function () {
			var oModel = this.getView().getModel();
			var bEditMode = oModel.getProperty("/oAppConfig/bEditMode");
			if (bEditMode === false) {
				oModel.setProperty("/oAppConfig/bEditMode", true);
			} else {
				oModel.setProperty("/oAppConfig/bEditMode", false);
			}
			this.mostrarCampo("btnCancel");
		},
		onTypeViaje: function () {
			var tipoViaje = this.byId("idTipoViaje").getValue();
			if (this.byId("idTipoViaje").getEditable()) {
				switch (tipoViaje) {
				case "SECA":
				case "Seca":
					this.getDataProductosSecos();
					this.getDataSegmentosSecos();
					break;
				case "LIQUIDO":
				case "Liquido":
				case "LIQUIDA":
					this.getDataProductosLiquidos();
					this.getDataSegmentosLiquidos();
					break;
				default:
					this.getProductos();
					this.getDataSegmentos();
					break;

				}
			} else {
				this.getProductos();
			}
		},

		onSegmento: function () {},
		returnIdListOfRequiredFields: function () {
			var requiredInputs = [];
			$('[data-required="true"]').each(function () {
				requiredInputs.push($(this).context.id.split("--")[2]);
			});
			return requiredInputs;
		},
		formatDateToSQL: function (fecha) {
			var sSeparator = "-";
			if (fecha === null) {
				return "";
			}
			if (typeof (fecha) === "object") {
				var year = fecha.getFullYear();
				var month = fecha.getMonth() + 1 > 9 ? fecha.getMonth() + 1 : "0" + (fecha.getMonth() + 1);
				var date = fecha.getDate() + 1 > 9 ? fecha.getDate() : "0" + fecha.getDate();
				return year + sSeparator + month + sSeparator + date;
			} else {
				return "No es un formato válido para enviar!!";
			}
		},
		onValidateFields: function () {
			var validated = true;
			var required = this.returnIdListOfRequiredFields();
			for (var i = 0; i < required.length; i++) {
				var input = this.byId(required[i]);
				var value = this.byId(required[i]).getValue();
				if (value.length > 0) {
					input.setValueState();
				} else {
					input.setValueState(sap.ui.core.ValueState.Error);
					input.setShowValueStateMessage(false);
					validated = false;
				}
			}
			return validated;
		},
		defaultNumber: function (numberValue) {
			var num = parseInt(numberValue, 10);
			return isNaN(num) ? null : num;
		},
		defaultNumberFloat: function (valor) {
			var input = valor.replace(/\./g, "");
			var s = input.replace(",", ".");
			parseFloat(s);
			if (s === "") {
				s = null;
			}
			return s;
		},
		onTipoCobro: function () {
			var tipoCobro = this.byId("idTipoCobro").getValue();
			if (tipoCobro === "PORCENTAJE") {
				this.mostrarCampo("idPorcentaje");
				this.byId("idValorPoliza").setVisible(false).setValue("");
			} else {
				this.mostrarCampo("idValorPoliza");
				this.byId("idPorcentaje").setVisible(false).setValue("");
			}
			this.onValidateFields();
			this.calcularRangoFlete();
		},
		onlyNumber: function (oEvent) {
			var algo = oEvent.getSource();
			var esNumero = oEvent.getSource().getValue() + "";
			var bFoundLetter = false;
			for (var letter of esNumero) {
				if(oEvent.getSource().getId().includes("idPorcentaje")){
					if (!(/^[0-9,]+$/.test(letter))) {
						bFoundLetter = true;
						break;
					}
				}else{
					if (!(/^[0-9]+$/.test(letter))) {
						bFoundLetter = true;
						break;
					}
				}
			}
			if (bFoundLetter) {
				var numero = algo.getValue();
				numero = numero + "";
				if (numero.length === 1) {
					algo.setValue("");
				} else {
					var numeroBien = numero.substr(0, 10);
					algo.setValue(parseInt((numeroBien), 10));
				}
			}
			if(oEvent.getSource().getId().includes("idPorcentaje")){
				var number = this.defaultNumberFloat(oEvent.getSource().getValue()) * 1;
				/*number = parseFloat(number).toFixed(2)
				oEvent.getSource().setValue(number);*/
				if(number > 100){
					oEvent.getSource().setValue(100);
				}
			}
			
		},
		fillDataInsertUpdate: function (action) {
			var columns = "";
			var modalidad = this.byId("idModalidad").getValue().toLocaleUpperCase();
			var tipoViaje = this.byId("idTipoViaje").getValue().toLocaleUpperCase();
			var codSegmento = this.defaultNumber(this.byId("idCodSegmento").getValue());
			var segmento = this.byId("idSegmento").getValue().toLocaleUpperCase();
			var codProducto = this.defaultNumber(this.byId("idCodProducto").getValue());
			var producto = this.byId("idProducto").getValue().toLocaleUpperCase();
			var codOrigen = this.defaultNumber(this.byId("idCodOrigen").getValue());
			var origen = this.byId("idOrigen").getValue().toLocaleUpperCase();
			var codDestino = this.defaultNumber(this.byId("idCodDestino").getValue());
			var destino = this.byId("idDestino").getValue().toLocaleUpperCase();
			var nitCliente = this.defaultNumber(this.byId("idCodCliente").getValue());
			var cliente = this.byId("idNomCliente").getValue().toLocaleUpperCase();
			var nitPoseedor = this.defaultNumber(this.byId("idCodPoseedor").getValue());
			var poseedor = this.byId("idNomPoseedor").getValue().toLocaleUpperCase();
			var fleteInicial = this.defaultNumberFloat(this.byId("idFleteInicial").getValue());
			var fleteFinal = this.defaultNumberFloat(this.byId("idFleteFinal").getValue());
			var tipoCobro = this.byId("idTipoCobro").getValue().toLocaleUpperCase();
			var valorTipoCobro = this.defaultNumberFloat(this.byId("idPorcentaje").getValue());
			var valorPoliza = this.defaultNumberFloat(this.byId("idValorPoliza").getValue());
			var ultimaModificacion = this.byId("idUltimaModificacion").getValue();
			var modificadoPor = this.byId("idModificadoPor").getValue().toLocaleUpperCase();
			var creadoPor = this.byId("idCreadoPor").getValue().toLocaleUpperCase();
			var fechaCreacion = this.byId("idFechaCreacion").getValue().toLocaleUpperCase();

			if (action === "create") {
				columns = "'" + modalidad + "','" + tipoViaje + "'," + codSegmento + ",'" + segmento + "'," + codProducto + ",'" + producto +
					"'," + codOrigen + ",'" + origen + "'," + codDestino + ",'" + destino + "'," + nitCliente + ",'" + cliente + "'," + nitPoseedor +
					",'" + poseedor + "'," + fleteInicial + "," + fleteFinal + ",'" + tipoCobro + "'," + valorTipoCobro + "," + valorPoliza + ",'" +
					ultimaModificacion + "','" + modificadoPor + "','" + creadoPor + "','" + fechaCreacion + "'";
				return columns;
			} else {
				columns = "modalidad\" = '" + modalidad + "',\"tipo_viaje\" = '" + tipoViaje + "', \"cod_segmento\" = " +
					codSegmento + ", \"segmento\"  = '" + segmento + "',  \"cod_producto\"  = " + codProducto + ",   \"producto\"  = '" +
					producto + "', \"cod_origen\"  = " + codOrigen + ", \"origen\"  =  '" + origen + "',    \"cod_destino\"  = " +
					codDestino + ",  \"destino\"  =  '" + destino + "', \"nit_cliente\"  = " + nitCliente + ",\"cliente\"  = '" + cliente +
					"' , \"nit_poseedor\"  = " + nitPoseedor + ", \"poseedor\"  =    '" + poseedor + "', \"flete_inicial\"  = " +
					fleteInicial + ", \"flete_final\"  =  " + fleteFinal + ",  \"tipo_cobro\"  = '" + tipoCobro + "', \"valor_tipo_cobro\"  = " +
					valorTipoCobro + ", \"valor_poliza\"  = " + valorPoliza + ", \"ultima_modificacion\"  = '" +
					ultimaModificacion + "', \"modificado_por\"  = '" + modificadoPor + "', \"creado_por\"  = '" + creadoPor + "',\"fechaCreacion";
				return columns;
			}

		},
		fillDataEdit: function (oRowData) {
			var oModel = this.getView().getModel();
			this.mostrarCampo("idSeparatorSystem");
			this.mostrarCampo("filterSystem");
			this.byId("idModalidad").setValue(oRowData.NAME);
			this.byId("idTipoViaje").setValue(oRowData.DESC1);
			this.byId("idCodSegmento").setValue(oRowData.DESC2);
			this.byId("idSegmento").setValue(oRowData.DESC3);
			this.byId("idCodProducto").setValue(oRowData.DESC4);
			this.byId("idProducto").setValue(oRowData.DESC5);
			this.byId("idCodOrigen").setValue(oRowData.DESC6);
			this.byId("idOrigen").setValue(oRowData.DESC7);
			this.byId("idCodDestino").setValue(oRowData.DESC8);
			this.byId("idDestino").setValue(oRowData.DESC9);
			this.byId("idCodCliente").setValue(oRowData.DESC10);
			this.byId("idNomCliente").setValue(oRowData.DESC11);
			this.byId("idCodPoseedor").setValue(oRowData.DESC12);
			this.byId("idNomPoseedor").setValue(oRowData.DESC13);
			this.byId("idFleteInicial").setValue(oRowData.DESC14.replace(".", ","));
			this.byId("idFleteFinal").setValue(oRowData.DESC15.replace(".", ","));
			this.byId("idTipoCobro").setValue(oRowData.DESC16);
			var tipoCobro = oRowData.DESC16;
			if (tipoCobro === "MONEDA") {
				this.mostrarCampo("idValorPoliza");
				this.byId("idPorcentaje").setVisible(false);
				this.byId("idValorPoliza").setValue(oRowData.DESC18.replace(".", ","));
			} else {
				this.byId("idValorPoliza").setVisible(false);
				this.mostrarCampo("idPorcentaje");
				this.byId("idPorcentaje").setValue(oRowData.DESC17);
			}
			this.byId("idUltimaModificacion").setValue(oRowData.DESC19);
			this.byId("idModificadoPor").setValue(oRowData.DESC20);
			this.byId("idCreadoPor").setValue(oRowData.DESC21);
			this.byId("idFechaCreacion").setValue(oRowData.DESC22);
			this.byId("btnUpdate").setVisible(false);
			this.byId("btnAdd").setVisible(false);
			oModel.setProperty("/oAppConfig/bEditMode", false);
		},
		calcularRangoFlete: function () {
			var aOriginalModelPolizas = this.oModel.getProperty("/mPolizas");
			var modelPolizas = JSON.parse(JSON.stringify(aOriginalModelPolizas));
			modelPolizas.forEach(function (poliza) {
				delete poliza.ID;
				delete poliza.DESC3;
				delete poliza.DESC5;
				delete poliza.DESC7;
				delete poliza.DESC9;
				delete poliza.DESC11;
				delete poliza.DESC13;
				delete poliza.DESC14;
				delete poliza.DESC15;
				delete poliza.DESC17;
				delete poliza.DESC18;
				delete poliza.DESC19;
				delete poliza.DESC20;
				delete poliza.DESC21;
				delete poliza.DESC22;
			});
			var newModelPoliza = {
				NAME: this.byId("idModalidad").getValue().toLocaleUpperCase(),
				DESC1: this.byId("idTipoViaje").getValue().toLocaleUpperCase(),
				DESC2: this.byId("idCodSegmento").getValue(),
				DESC4: this.byId("idCodProducto").getValue() === "" ? null : this.byId("idCodProducto").getValue(),
				DESC6: this.byId("idCodOrigen").getValue() === "" ? null : this.byId("idCodOrigen").getValue(),
				DESC8: this.byId("idCodDestino").getValue() === "" ? null : this.byId("idCodDestino").getValue(),
				DESC10: this.byId("idCodCliente").getValue() === "" ? null : this.byId("idCodCliente").getValue(),
				DESC12: this.byId("idCodPoseedor").getValue() === "" ? null : this.byId("idCodPoseedor").getValue(),
				DESC16: this.byId("idTipoCobro").getValue().toLocaleUpperCase()
			};
			for (var i = 0; i < modelPolizas.length; i++) {
				if (JSON.stringify(modelPolizas[i]) === JSON.stringify(newModelPoliza)) {
					var fFinal = this.oModel.getProperty("/mPolizas")[i].DESC15.replace(".", ",");
					this.byId("idFleteInicial").setValue(fFinal);
					this.byId("idFleteInicial").setEditable(false);
					this.onCalcularFleteFinal();
					i = modelPolizas.length;
				} else {
					this.byId("idFleteInicial").setEditable(true);
				}
			}
			this.onValidateFields();

		},

		onClean: function () {
			this.byId("idSegmento").setValue("");
			this.byId("idProducto").setValue("");
		},
		onCalcularFleteFinal: function () {
			var fleteInicial = this.defaultNumberFloat(this.byId("idFleteInicial").getValue());
			var fleteFinal = this.defaultNumberFloat(this.byId("idFleteFinal").getValue());
			fleteInicial = parseFloat(fleteInicial);
			fleteFinal = parseFloat(fleteFinal);
			if (fleteFinal === 0 || fleteFinal <= fleteInicial) {
				this.byId("idFleteFinal").setValue("");
				Util.onShowMessage("EL FLETE FINAL DEBE SER MAYOR AL FLETE INICIAL", "toast");
			}
			this.onValidateFields();
		},
		onDateRules: function () {
			var arrRules = this.onRulExisiting(this.byId("idModalidad").getValue().toLocaleUpperCase(),
				this.byId("idProducto").getValue().toLocaleUpperCase(),
				this.byId("idSegmento").getValue().toLocaleUpperCase(),
				this.byId("idTipoViaje").getValue().toLocaleUpperCase(),
				this.byId("idOrigen").getValue().toLocaleUpperCase(),
				this.byId("idDestino").getValue().toLocaleUpperCase(),
				this.byId("idFleteInicial").getValue(),
				this.byId("idFleteFinal").getValue(),
				this.byId("idNomCliente").getValue().toLocaleUpperCase(),
				this.byId("idNomPoseedor").getValue().toLocaleUpperCase(),
				this.byId("idTipoCobro").getValue().toLocaleUpperCase(),
				this.byId("idPorcentaje").getValue(),
				this.byId("idValorPoliza").getValue());
			return arrRules;
		},
		fillDataUpdate: function () {

		},
		onSave: function (oEvent) {
			var oModel = this.getView().getModel();
			var oAction = oEvent.getParameters().id.split("--")[2];
			var search = null;
			var arrRules = this.onDateRules();
			if (this.onValidateFields()) {
				if (arrRules.length === 0) {
					Util.showBI(true);
					var columns = "";
					switch (oAction) {
					case "btnAdd":
						this.byId("idCreadoPor").setValue(this.varPIuser.firstname + " " + this.varPIuser.lastname);
						this.byId("idFechaCreacion").setValue(Util.validateDate());
						columns = this.fillDataInsertUpdate("create");
						search = "\"id_poliza\"= 0";
						try {
							Util.insertDataDB(columns, "POLIZAS_TRAYECTOS", search);
							oModel.setProperty(this.modelPolizas, this.getDataPolizas());
							this.mostrarCampo("idButtonEdit");
							this.byId("btnAdd").setVisible(false);
						} catch (error) {
							Util.onShowMessage(error, "toast");
							this.onNavBack();
						}
						break;
					case "btnUpdate":
						this.byId("idModificadoPor").setValue(this.varPIuser.firstname + " " + this.varPIuser.lastname);
						this.byId("idUltimaModificacion").setValue(Util.validateDate());
						columns = this.fillDataInsertUpdate("update");
						var id = parseInt(this.byId("id_poliza").getValue(), 10);
						if (isNaN(id)) {
							this.getIdPoliza();
							id = this.idPoliza;
						}
						search = "\"id_poliza\"= " + id;
						try {
							// Util.insertDataDB(columns, "POLIZAS_TRAYECTOS", search);
                          	Util.updateDB(columns, "POLIZAS_TRAYECTOS", id, this.byId("idFechaCreacion").getValue().toLocaleUpperCase(), "id_poliza", "");
							oModel.setProperty(this.modelPolizas, this.getDataPolizas());
							this.byId("btnUpdate").setVisible(false);
							this.byId("btnCancel").setVisible(false);
						} catch (error) {
							Util.onShowMessage(error, "toast");
						}
						break;
					}
					Util.showBI(false);
					oModel.setProperty("/oAppConfig/bEditMode", false);
					oModel.setProperty(this.modelPolizas, this.getDataPolizas());

				} else {
					Util.onShowMessage("Ya existe una regla con la misma información", "info");
				}
			} else {
				Util.onShowMessage("Verifique los campos en rojo", "toast");
			}
		},
		restartFieldsMenu: function () {
			var oModel = this.getView().getModel();
			this.byId("idModalidad").setValue("").setValueState();
			this.byId("idTipoViaje").setValue("").setEditable(true);
			this.byId("idCodSegmento").setValue("").setValueState();
			this.byId("idSegmento").setValue("").setValueState().setEditable(true);
			this.byId("idCodProducto").setValue("").setValueState();
			this.byId("idProducto").setValue("").setValueState().setEditable(true);
			this.byId("idCodOrigen").setValue("");
			this.byId("idOrigen").setValue("");
			this.byId("idCodDestino").setValue("");
			this.byId("idDestino").setValue("");
			this.byId("idCodCliente").setValue("");
			this.byId("idNomCliente").setValue("");
			this.byId("idCodPoseedor").setValue("");
			this.byId("idNomPoseedor").setValue("");
			this.byId("idFleteInicial").setValue("").setValueState();
			this.byId("idFleteFinal").setValue("").setValueState();
			this.byId("idTipoCobro").setValue("");
			this.byId("idPorcentaje").setValue("").setValueState();
			this.byId("idValorPoliza").setValue("").setValueState();
			this.byId("idUltimaModificacion").setValue("");
			this.byId("idModificadoPor").setValue("");
			this.byId("idCreadoPor").setValue("");
			this.byId("idFechaCreacion").setValue("");
			this.byId("idSeparatorSystem").setVisible(false);
			this.byId("filterSystem").setVisible(false);
			this.byId("btnCancel").setVisible(false);
			this.byId("btnUpdate").setVisible(false);
			this.byId("idButtonEdit").setVisible(false);
			this.mostrarCampo("btnAdd");
			oModel.setProperty("/oAppConfig/bEditMode", true);
		},
		onRulExisiting: function (modalidad, producto, segmento, tipoViaje, origen, destino, fleteIn, fleteFi, cliente, poseedor, tipoCobro,
			porcentaje, poliza) {
			var that = this;
			var arrRules = [];
			var fleteInicial = this.defaultNumberFloat(fleteIn);
			var fleteFinal = this.defaultNumberFloat(fleteFi);
			var valorPorcentaje = this.defaultNumberFloat(porcentaje);
			var valorPoliza = this.defaultNumberFloat(poliza);
			if (valorPoliza === null) {
				valorPoliza = 'IS NULL';
				valorPorcentaje = '=' + valorPorcentaje;
			} else {
				valorPoliza = '=' + valorPoliza;
				valorPorcentaje = 'IS NULL';
			}

			var sql =
				`SELECT * FROM <tenant_schema>."POLIZAS_TRAYECTOS" where "modalidad" =  '${modalidad}' AND 
				 "tipo_viaje" = '${tipoViaje}' AND 
             	"segmento" = '${segmento}' AND
             	"producto" = '${producto}' AND
             	"origen" = '${origen}'  AND
              	"destino" = '${destino}' AND
               	"cliente" =  '${cliente}' AND 
	            "poseedor" = '${poseedor}' AND 
	            "flete_inicial" = ${fleteInicial} AND
	            "flete_final" = ${fleteFinal} AND 
	            "tipo_cobro" = '${tipoCobro}' AND 
	            "valor_tipo_cobro"  ${valorPorcentaje} AND 
	            "valor_poliza"  ${valorPoliza} `;

			var data1 = {
				NameTable: "str",
				ColumnQua: 24,
				OrderBy: sql,
				ColumnSelect: "",
				GroupBy: ""
			};

			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/nselect.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						arrRules = data.data;
					}
				},
				error: function (err) {

				}
			});
			return arrRules;

		},
		_filter: function () {
			var oFilter = null;
			if (this._oTxtFilter) {
				oFilter = this._oTxtFilter;
			}
			this.byId(this.tableNameView).getBinding("rows").filter(oFilter, "Application");
		},
		onHandleTxtFilter: function (oEvent) {
			var oView = this.getView();
			oView.setModel(new JSONModel({
				filterValue: ""
			}), "ui");
			this._oTxtFilter = null;
			var sQuery = oEvent ? oEvent.getParameter("query") : null;
			this._oTxtFilter = null;
			if (sQuery) {
				this._oTxtFilter = new Filter([
					new Filter("ID", FilterOperator.Contains, sQuery),
					new Filter("NAME", FilterOperator.Contains, sQuery)
				], false);
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
		// Fragmentos
		handleValueHelpSegmentos: function (oEvent) {
			this.onTypeViaje();
			var id = oEvent.getParameters("id").id.split("--")[2];
			var sInputValue = this.byId(id).getValue(),
				oModel = this.getView().getModel(),
				aSegmentos = oModel.getProperty("/mSegmentos");
			this.varInputSegmento = id;
			if (!this._oValueHelpDialogSegmentos) {
				this._oValueHelpDialogSegmentos = sap.ui.xmlfragment(
					"polizas.view.fragment.segmentos",
					this
				);
				this.getView().addDependent(this._oValueHelpDialogSegmentos);
			}
			aSegmentos.forEach(function (oProduct) {
				oProduct.selected = (oProduct.ID === sInputValue);
			});
			oModel.setProperty("/mSegmentos", aSegmentos);
			this._oValueHelpDialogSegmentos.open();
		},
		handleCloseSegmentos: function (oEvent) {
			var oSegmento = oEvent.getParameter("selectedContexts")[0].getObject();
			var idSegmento = this.byId("idCodSegmento");
			var segmento = this.byId("idSegmento");
			var tipoViaje = this.byId("idTipoViaje");
			idSegmento.setValue(oSegmento.ID);
			segmento.setValue(oSegmento.NAME);
			tipoViaje.setValue(oSegmento.DESC).setEditable(false);

			this.byId("idSegmento").setValueState();
			this.calcularRangoFlete();
			this._oValueHelpDialogSegmentos.destroy();
			this._oValueHelpDialogSegmentos = undefined;
		},
		handleValueHelpProductos: function (oEvent) {
			this.onTypeViaje();
			var id = oEvent.getParameters("id").id.split("--")[2];
			var sInputValue = this.byId(id).getValue(),
				oModel = this.getView().getModel(),
				aProductos = oModel.getProperty("/mProductos");
			this.varInputSegmento = id;
			if (!this._oValueHelpDialogProductos) {
				this._oValueHelpDialogProductos = sap.ui.xmlfragment(
					"polizas.view.fragment.productos",
					this
				);
				this.getView().addDependent(this._oValueHelpDialogProductos);
			}
			aProductos.forEach(function (oProduct) {
				oProduct.selected = (oProduct.ID === sInputValue);
			});
			oModel.setProperty("/mProductos", aProductos);
			this._oValueHelpDialogProductos.open();
		},
		handleCloseProductos: function (oEvent) {
			var oProductos = oEvent.getParameter("selectedContexts")[0].getObject();
			var idCodProducto = this.byId("idCodProducto");
			var producto = this.byId("idProducto");
			var idSegmento = this.byId("idSegmento");
			var codSegmento = this.byId("idCodSegmento");
			var tipoViaje = this.byId("idTipoViaje");

			idCodProducto.setValue(oProductos.ID);
			producto.setValue(oProductos.DESC2).setValueState();
			idSegmento.setValue(oProductos.DESC7).setEditable(false);
			tipoViaje.setValue(oProductos.DESC8).setEditable(false);

			var oSegmentos = this.oModel.getProperty("/mSegmentos");
			oSegmentos.forEach(function (segmento) {
				if (segmento.NAME === oProductos.DESC7) {
					codSegmento.setValue(segmento.ID);
				}
			});
			this.calcularRangoFlete();
			this._oValueHelpDialogProductos.destroy();
			this._oValueHelpDialogProductos = undefined;
		},
		handleValueHelpCiudad: function (oEvent) {
			this.getDataDivisionPoliticaDB();
			var id = oEvent.getParameters("id").id.split("--")[2];
			var sInputValue = this.byId(id).getValue(),
				oModel = this.getView().getModel(),
				aCiudades = oModel.getProperty("/mDivisionPolitica");
			this.varInputCiudad = id;
			if (!this._oValueHelpDialogCiudad) {
				this._oValueHelpDialogCiudad = sap.ui.xmlfragment(
					"polizas.view.fragment.ciudades",
					this
				);
				this.getView().addDependent(this._oValueHelpDialogCiudad);
			}
			aCiudades.forEach(function (oProduct) {
				oProduct.selected = (oProduct.ID === sInputValue);
			});
			oModel.setProperty("/mDivisionPolitica", aCiudades);
			this._oValueHelpDialogCiudad.open();
		},
		handleCloseCiudades: function (oEvent) {
			var oInput = this.byId(this.varInputCiudad);
			this.byId(this.varInputCiudad).setValueState();
			var inputCiudad = "";
			if (this.varInputCiudad === "idOrigen") {
				inputCiudad = this.byId("idCodOrigen");
			} else {
				inputCiudad = this.byId("idCodDestino");
			}
			var aContexts = oEvent.getParameter("selectedContexts");
			aContexts.map(function (oContext) {
				oInput.setValue(oContext.getObject().NAME);
				inputCiudad.setValue(oContext.getObject().NAME);
			});
			this.calcularRangoFlete();
			this._oValueHelpDialogCiudad.destroy();
			this._oValueHelpDialogCiudad = undefined;
		},
		onFilterCiudad: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter([
				new Filter("ID", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("NAME", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("DESC", sap.ui.model.FilterOperator.Contains, sValue)

			]);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		onFilter: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter([
				new Filter("ID", FilterOperator.Contains, sValue),
				new Filter("NAME", FilterOperator.Contains, sValue),
				new Filter("DESC", FilterOperator.Contains, sValue),
				new Filter("DESC1", FilterOperator.Contains, sValue),
				new Filter("DESC2", FilterOperator.Contains, sValue),
				new Filter("DESC5", FilterOperator.Contains, sValue),
				new Filter("DESC4", FilterOperator.Contains, sValue),
				new Filter("DESC6", FilterOperator.Contains, sValue)

			]);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleValueHelpClientes: function (oEvent) {
			this.getDataClientes();
			var id = oEvent.getParameters("id").id.split("--")[2];
			var sInputValue = this.byId(id).getValue(),
				oModel = this.getView().getModel(),
				aClientes = oModel.getProperty("/mClientes");
			this.varInputCliente = id;
			if (!this._oValueHelpDialogClientes) {
				this._oValueHelpDialogClientes = sap.ui.xmlfragment(
					"polizas.view.fragment.clientes",
					this
				);
				this.getView().addDependent(this._oValueHelpDialogClientes);
			}
			aClientes.forEach(function (oProduct) {
				oProduct.selected = (oProduct.ID === sInputValue);
			});
			oModel.setProperty("/mClientes", aClientes);
			this._oValueHelpDialogClientes.open();
		},
		handleCloseClientes: function (oEvent) {
			var oClientes = oEvent.getParameter("selectedContexts")[0].getObject();
			var idCodCliente = this.byId("idCodCliente");
			var nombreCliente = this.byId("idNomCliente");
			idCodCliente.setValue(oClientes.ID);
			nombreCliente.setValue(oClientes.NAME);
			this.calcularRangoFlete();
			this._oValueHelpDialogClientes.destroy();
			this._oValueHelpDialogClientes = undefined;

		},
		handleValueHelpPoseedores: function (oEvent) {
			this.getDataPoseedores();
			var id = oEvent.getParameters("id").id.split("--")[2];
			var sInputValue = this.byId(id).getValue(),
				oModel = this.getView().getModel(),
				aPoseedores = oModel.getProperty("/mPoseedores");
			this.varInputPoseedor = id;
			if (!this._oValueHelpDialogPoseedores) {
				this._oValueHelpDialogPoseedores = sap.ui.xmlfragment(
					"polizas.view.fragment.poseedores",
					this
				);
				this.getView().addDependent(this._oValueHelpDialogPoseedores);
			}
			aPoseedores.forEach(function (oProduct) {
				oProduct.selected = (oProduct.ID === sInputValue);
			});
			oModel.setProperty("/mPoseedores", aPoseedores);
			this._oValueHelpDialogPoseedores.open();

		},
		handleClosePoseedores: function (oEvent) {
			var oPoseedores = oEvent.getParameter("selectedContexts")[0].getObject();
			var idCodPoseedor = this.byId("idCodPoseedor");
			var nombrePoseedor = this.byId("idNomPoseedor");
			idCodPoseedor.setValue(oPoseedores.DESC6);
			nombrePoseedor.setValue(oPoseedores.DESC5);
			this.calcularRangoFlete();
			this._oValueHelpDialogPoseedores.destroy();
			this._oValueHelpDialogPoseedores = undefined;
		},
		// Consultas a la BD
		getDataPoseedores: function () {
			var that = this;
			var data1 = {
				NameTable: "PROVEEDOR_TRANSPORTE",
				ColumnQua: 74,
				OrderBy: "numero_documento",
				ColumnSelect: "*",
				GroupBy: "WHERE \"poseedor\" = \'true\'"
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelPoseedores, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getProductos: function () {
			var that = this;
			var data1 = {
				NameTable: "PRODUCTOS",
				ColumnQua: 12,
				OrderBy: "cod",
				ColumnSelect: "*",
				GroupBy: ""
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({

				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {

						that.oModel.setProperty(that.modelProductos, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataSegmentos: function () {
			var that = this;
			var data1 = {
				NameTable: "SEGMENTO",
				ColumnQua: 3,
				OrderBy: "codigo",
				ColumnSelect: "*",
				GroupBy: ""
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelSegmentos, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataDivisionPoliticaDB: function () {
			var that = this;
			var data1 = {
				NameTable: that.tableDivisionPolitica,
				ColumnQua: 11,
				OrderBy: "codigo",
				ColumnSelect: "*",
				GroupBy: ""
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {

						that.oModel.setProperty(that.modelDivisionPolitica, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataClientes: function () {
			var that = this;
			var data1 = {
				NameTable: "CLIENTES_VIEW",
				ColumnQua: 2,
				OrderBy: "numero_documento",
				ColumnSelect: "\"numero_documento\", \"razon_social\" ",
				GroupBy: ""
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelClientes, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataPolizas: function () {
			var that = this;
			var data1 = {
				NameTable: "POLIZAS_TRAYECTOS",
				ColumnQua: 24,
				OrderBy: "id_poliza",
				ColumnSelect: "*",
				GroupBy: ""
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelPolizas, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataPolizasEdit: function (idEdit) {
			var that = this;
			var data1 = {
				NameTable: "POLIZAS_TRAYECTOS",
				ColumnQua: 24,
				OrderBy: "id_poliza",
				ColumnSelect: "*",
				GroupBy: 'Where "id_poliza" = ' + "'" + idEdit + "'"
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.DataEdit = data.data;
					}
				},
				error: function (err) {}
			});
		},
		getDataProductosSecos: function () {
			var that = this;
			var data1 = {
				NameTable: "PRODUCTOS",
				ColumnQua: 13,
				OrderBy: "cod",
				ColumnSelect: "*",
				// GroupBy: "Where (\"tipo_carga\" = 'Seca' OR \"tipo_carga\" = 'SECA') AND \"segmento\" = '"  +  this.byId("idSegmento").getValue() + "'"
				GroupBy: "Where (\"tipo_carga\" = 'Seca' OR \"tipo_carga\" = 'SECA') "

			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelProductos, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataSegmentosSecos: function () {
			var that = this;
			var data1 = {
				NameTable: "SEGMENTO",
				ColumnQua: 3,
				OrderBy: "codigo",
				ColumnSelect: "*",
				GroupBy: "Where \"tipo_carga\" = 'SECA'"
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelSegmentos, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataSegmentosLiquidos: function () {
			var that = this;
			var data1 = {
				NameTable: "SEGMENTO",
				ColumnQua: 3,
				OrderBy: "codigo",
				ColumnSelect: "*",
				GroupBy: "Where \"tipo_carga\" = 'LIQUIDA'"

			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelSegmentos, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getDataProductosLiquidos: function () {
			var that = this;
			var data1 = {
				NameTable: "PRODUCTOS",
				ColumnQua: 13,
				OrderBy: "cod",
				ColumnSelect: "*",
				// GroupBy: "Where \"tipo_carga\" = 'Liquido' OR \"tipo_carga\" = 'LIQUIDO' OR \"tipo_carga\" = 'LIQUIDA' AND \"segmento\" = '"  +  this.byId("idSegmento").getValue() + "'"
				GroupBy: "Where \"tipo_carga\" = 'Liquido' OR \"tipo_carga\" = 'LIQUIDO' OR \"tipo_carga\" = 'LIQUIDA' "

			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.oModel.setProperty(that.modelProductos, data.data);
					}
				},
				error: function (err) {}
			});
		},
		getIdPoliza: function () {
			// Captura el id de la ultima poliza creada
			var that = this;
			var data1 = {
				NameTable: "POLIZAS_TRAYECTOS",
				ColumnQua: 1,
				ColumnSelect: 'MAX("id_poliza") AS "id_poliza"',
				OrderBy: "id_poliza"
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						that.idPoliza = data.data[0].ID;
					}
				},
				error: function (err) {}
			});
		},
		onTipoModalidad: function () {
			var tipoModalidad = this.byId("idModalidad").getValue();
			if (tipoModalidad === "URBANO") {
				this.byId("idValorPoliza").setValue(45000);
			} else {
				this.byId("idValorPoliza").setValue(13000);
			}
		},

	});
});