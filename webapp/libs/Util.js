sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator"
], function (MessageBox, MessageToast, BusyIndicator) {
	"use srtict";

	return {
		console: console,
		hanadb: "/hanadb",
		styleClass: "sapUiSizeCompact",

		showConsole: function (_message, _type) {
			try {
				if (_message !== undefined && _type !== undefined) {
					switch (_type) {
					case "info":
						this.console.info(_message);
						break;
					case "error":
						this.console.error(_message);
						break;
					case "warn":
						this.console.warn(_message);
						break;
					case "done":
						this.console.log("%c" + _message, "color: Green ");
						break;
					}
				} else {
					this.console.warn("_message or _type are undefined");
				}
			} catch (err) {
				this.console.warn(err.stack);
			}
		},

		onShowMessage: function (_message, _type) {
			try {
				if (_message !== undefined && _type !== undefined) {
					switch (_type) {
					case "info":
						MessageBox.information(_message, {
							styleClass: this.styleClass
						});
						break;
					case "error":
						MessageBox.error(_message, {
							styleClass: this.styleClass
						});
						break;
					case "warn":
						MessageBox.warning(_message, {
							styleClass: this.styleClass
						});
						break;
					case "toast":
						MessageToast.show(_message);
						break;
					case "done":
						MessageBox.success(_message, {
							styleClass: this.styleClass
						});
						break;
					}
				} else {
					this.console.warn("_message or _type are undefined");
				}
			} catch (err) {
				this.console.warn(err.stack);
			}
		},

		insertDataDB: function (columns, tableName, search) {
			var that = this;
			var data1 = {
				NameTable: tableName,
				Text: columns,
				Search: search
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/insert.xsjs",
				TYPE: "POST",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data.code === 1) {
						that.onShowMessage("Registro Exitoso", "done");
					} else {
						that.onShowMessage("Error al guardar el registro. \nError: " + data.message, "error");
					}
				},
				error: function (err) {
					that.onShowMessage("Error en el Ajax. \nError: " + err);
				}
			});
		},
		updateDB: function (columns, tableName, search, newData, columnSearch) {
			var that = this;
			var data1 = {
				NameTable: tableName,
				Columns: columns,
				Search: search,
				NewData: newData,
				ColumnSearch: columnSearch
			};
			var datavalue = JSON.stringify(data1);
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/update.xsjs",
				TYPE: "POST",
				data: {
					dataobject: datavalue
				},
				method: "GET",
				success: function (data) {
					if (data.code === 1) {
						that.onShowMessage("Se actualizo correctamente", "done");
					} else {
						that.onShowMessage("Error al guardar el registro. \nError: " + data.message, "error");
					}
				},
				error: function (err) {
					that.onShowMessage("Error en el Ajax. \nError: " + err);
				}
			});
		},
		deleteDataBD: function (nameTable, searchDB) {
			var that = this;
			var data1 = {
				NameTable: nameTable,
				Search: searchDB
			};
			var dataValue = JSON.stringify(data1);
			var dataReturned = null;
			jQuery.ajax({
				async: false,
				url: this.hanadb + "/xsjs/delete.xsjs",
				TYPE: "POST",
				data: {
					dataobject: dataValue
				},
				method: "GET",
				success: function (data) {
					dataReturned = data;
				},
				error: function (err) {
					that.onShowMessage("Error en el Ajax. \nError: " + err);
				}
			});
			return dataReturned;
		},

		showBI: function (value) {
			if (value) {
				BusyIndicator.show(0);
			} else {
				BusyIndicator.hide();
			}
		},
		validateDate: function () {

			var hoy = new Date();
			var dd = hoy.getDate();
			var mm = hoy.getMonth() + 1;
			var yyyy = hoy.getFullYear();
			var hh = hoy.getHours();
			var mes = hoy.getMinutes();
			var ss = hoy.getSeconds();

			dd = this.addZero(dd);
			mm = this.addZero(mm);
			hh = this.addZero(hh);

			var fecha = yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mes + ":" + ss;

			return fecha;
		},
		addZero: function (i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		},
		onCreateAddress: function (frg) {

			// Via principal
			var TypeRoad = frg.byId("idTypeRoad").getSelectedItem().getKey();

			var numberCalle = frg.byId("idMainNumber").getValue().toLocaleUpperCase();
			var SelectedBis = frg.byId("idBis").getSelected();
		//	var s = SelectedBis ? frg.byId("idShowBis").setVisible(true) : frg.byId("idShowBis").setVisible(false);
			var mainLetter = frg.byId("idMainLetter").getSelectedItem().getText();
			var BIS = SelectedBis ? "BIS" : "";
			var letterBis = frg.byId("idShowBis").getSelectedItem().getText();
			var cardinalityE = frg.byId("idEast").getSelected();
			var cardinalityS = frg.byId("idSouth").getSelected();
			var CardinalityE = cardinalityE ? "Este" : "";
			var CardinalityS = cardinalityS ? "Sur" : "";

			// Via Secundaria
			var SecondNumber = frg.byId("idSecondNumber").getValue().toLocaleUpperCase();
			var SecondLetter = frg.byId("idSecondLetter").getSelectedItem().getText();

			// Complemento
			var complNumber = frg.byId("idComplementNumber").getValue().toLocaleUpperCase();
			var eastComplement = frg.byId("idEastComplement").getSelected();
			var southComplement = frg.byId("idSouthComplement").getSelected();
			var CardinalitEC = eastComplement ? "Este" : "";
			var CardinalitySC = southComplement ? "Sur" : "";

			// Muestra la direccion final
			return TypeRoad + " " + numberCalle + " " + " " + mainLetter + " " + BIS + " " + letterBis + " " + CardinalityE + " " +
				CardinalityS + " " + SecondNumber + " " + SecondLetter + " " + complNumber + " " + CardinalitEC + " " +
				CardinalitySC;

		},
		agregarDireccion: function (frg){
			var place = frg.byId("idPlace").getSelectedItem().getKey();
			var placeNumber = frg.byId("idPlaceNumber").getValue().toLocaleUpperCase();
			
			return  place + " " + placeNumber;
		},
		
		generateSelect: function (_oModel,_bReturnDESC) {
			let Util = this;
			let sService = _bReturnDESC?"nselect.xsjs":"cselect.xsjs";
			return function (_sNameTable, _iColumnQua, _sColumnOrder, _arrModelProperty, _sWhere = "", _bAsync = false, _bReturn = false,_fnCallback) {
				let arrDataResult = [];
				let oDataSend = {
					NameTable: _sNameTable,
					ColumnQua: _iColumnQua,
					OrderBy: _sColumnOrder,
					ColumnSelect: "*",
					GroupBy: _sWhere
				};
				jQuery.ajax({
					url: Util.hanadb + `/xsjs/${sService}`,
					method: "GET",
					async: _bAsync,
					data: {
						dataobject: JSON.stringify(oDataSend)
					},
					success: function (oDataResponse) {
						if (oDataResponse.data.length > 0) {
							arrDataResult = oDataResponse.data;
						}
						if(_oModel){
							_oModel.setProperty(_arrModelProperty, arrDataResult);
						}
						if(_fnCallback){
							_fnCallback(arrDataResult);
						}
					},
					error: function (oError) {
						Util.console.log(oError);
						Util.console.trace();
					}
				});
				if (_bReturn) {
					return arrDataResult;
				}
			};
		},
		
		onValidateDigito: function (nit) {
			var arreglo, x, y, longitudNit;
			arreglo = new Array(16);
			longitudNit = nit.length;

			arreglo[1] = 3;
			arreglo[2] = 7;
			arreglo[3] = 13;
			arreglo[4] = 17;
			arreglo[5] = 19;
			arreglo[6] = 23;
			arreglo[7] = 29;
			arreglo[8] = 37;
			arreglo[9] = 41;
			arreglo[10] = 43;
			arreglo[11] = 47;
			arreglo[12] = 53;
			arreglo[13] = 59;
			arreglo[14] = 67;
			arreglo[15] = 71;
			x = 0;
			y = 0;

			for (var i = 0; i < longitudNit ; i++) {
				y = (nit.substr(i, 1));

				x += (y * arreglo[longitudNit - i]);
			}
			y = x % 11;
			if (y > 1) {
				nit = 11 - y;
			} else {
				nit = y;
			}
			return nit;
		}
	};
});