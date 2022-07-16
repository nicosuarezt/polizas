sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
   	"polizas/libs/Util"
], function (MessageBox, MessageToast, BusyIndicator, Util) {
	"use srtict";
	return {
		getDataRolesxElemento: function (iIDRol, sNameApp, sIdElement, oContext) {
			let that = this;
			let arrRolesxElement = [];
			var addSQL=" ";
			if(sIdElement!=null){
				addSQL+="AND TypeElemen.\"ID_elemento\" ='" + sIdElement + "' ";
			}
			let sql = "SELECT Roles.\"nombre_rol\" , Roles.\"estado\" , TypeElemen.\"ID_elemento\", TypeElemen.\"tipo_elemento\", RXE.\"read\", RXE.\"update\" " +
				"FROM \"SC_MTA_DB_2\".\"sc-mta-db::tables.ROLES_X_ELEMENTOS\" AS RXE INNER JOIN \"SC_MTA_DB_2\".\"sc-mta-db::tables.TIPOS_ELEMENTOS\" AS TypeElemen " +
				"ON TypeElemen.\"id\" = RXE.\"ID_elemento\"  INNER JOIN \"SC_MTA_DB_2\".\"sc-mta-db::tables.MODULO\" AS Modulos " +
				"ON Modulos.\"id\" = TypeElemen.\"ID_Modulo\" INNER JOIN \"SC_MTA_DB_2\".\"sc-mta-db::tables.ROLES\" AS Roles " +
				"ON Roles.\"id\" = RXE.\"ID_rol\" WHERE Roles.\"id\" ="+iIDRol+" AND Roles.\"estado\"= true AND  Modulos.\"nombre_tecnico\"='"+sNameApp+"' "+ addSQL +
				"ORDER BY Roles.\"nombre_rol\" ";
			let data1 = {
				NameTable: "str",
				ColumnQua: 6,
				OrderBy: sql,
				ColumnSelect: "",
				GroupBy: ""
			};
			let datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: Util.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data) {
						let arrResult = data.data;
						for (let i = 0; i < arrResult.length; i++) {
							let oElement = oContext.byId(arrResult[i].DESC1);
							let bExistsElement = oElement!==undefined;
							if(!bExistsElement){
								oElement = sap.ui.getCore().byId(arrResult[i].DESC1);
								bExistsElement = oElement!==undefined;
							}
							if(bExistsElement){
								let bHasEnabled = bExistsElement && oElement.getEnabled!==undefined; 
								let objRolesxElement = {};
								objRolesxElement.nombre_rol = arrResult[i].ID;
								objRolesxElement.estado = that.defaultBoolean(arrResult[i].NAME);
								objRolesxElement.id_elemento = arrResult[i].DESC1;
								objRolesxElement.toHaveEnebled = bHasEnabled;
								objRolesxElement.read =  that.defaultBoolean(arrResult[i].DESC3);
								objRolesxElement.update = that.defaultBoolean(arrResult[i].DESC4);
								arrRolesxElement.push(objRolesxElement);
							}
						}
					}
				},
				error: function (oError) {}
			});
			return arrRolesxElement;
		},
		defaultBoolean: function (stringBoolean) {
			return stringBoolean === "true" ? true : false;
		},
		onElements: function(sIds, modelPermissions, _callBack){
			let arrFilter = modelPermissions.filter(x => x.id_elemento === sIds);
			if (arrFilter.length > 0) {
				return  _callBack(arrFilter[0].read, sIds);
			}else {
				return  _callBack(false, sIds);
			}
		},
		getRol: function(sEmailUser){
			let iIdRol = null;
			let sql = "SELECT * FROM \"SC_MTA_DB_2\".\"sc-mta-db::tables.USUARIOS\" " +
				"WHERE \"ID_Usuario\"='"+sEmailUser+"' ;";
			let oConsulData = {
				NameTable: "str",
				ColumnQua: 4,
				OrderBy: sql,
				ColumnSelect: "",
				GroupBy: ""
			};
			let datavalue = JSON.stringify(oConsulData);
			jQuery.ajax({
				async: false,
				url: Util.hanadb + "/xsjs/select.xsjs",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (oData) {
					if (oData) {
						let arrResult = oData.data;
						if (arrResult.length > 0){
							iIdRol = parseInt(arrResult[0].DESC2,10);
						}
					}
				},
				error: function (oError) {}
			});
			return iIdRol;
		}

	};
});