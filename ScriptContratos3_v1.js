// ═══════════════════════════════════════════════════════════════════════════════
// ScriptContratos3 v1 — Inmuebles Audiovisuales
// Backend principal. Desplegado como Web App en Google Apps Script.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CONFIG3 = {
  SHEETS_ID                           : '1jkv6Ek2rgkf7eB2Mu3avhXvG32n6nZxTzIL2tbhqOF0',
  CARPETA_SISTEMA_ID                  : '1IoIm2ckqmI-BAf5TBKf5EixVQrg6Bmmk',
  CARPETA_PROYECTOS_ID                : '1PRZeVQr6cEgjkrso6eBPf9BA6dbv8XU3',
  TEMPLATE_CONTRATO_ID                : '11NGZ2Tdxh3E2PdNAtuZ07EkOL9fu7w_KCHhXym8kwU4',
  TEMPLATE_REFERENCIAS_RESIDENCIAL_ID : '1IoZ2dL_WoAlmDdQI2PuhUtYVujRknptwBUVD_ZJQH5A',
  TEMPLATE_REFERENCIAS_TERRENO_ID     : '1hNPqSLQq4br26LlUR4-Zc_lqZGxYl9-o6E-gk-uNo64',

  BASE_URL_PORTAL     : 'https://inmueblesaudiovisuales.com/portal.html',
  BASE_URL_CONFIGURAR : 'https://inmueblesaudiovisuales.com/configurar3.html',

  BRUNO_EMAIL : 'inmueblesaudiovisuales@gmail.com',
  WA_LINK     : 'https://wa.me/5218127174207',
  CLIP_LINK   : 'https://linkdenegocio.mx/@inmueblesaudiovisuales/pagar',
  BANCO       : 'Banamex',
  CLABE       : '002580905411451243',
  CUENTA      : '1145124',
  TITULAR     : 'Bruno Gutierrez Salazar',

  HOJA_CONTRATOS   : 'Contratos3',
  HOJA_TOKENS      : 'Tokens3',
  HOJA_ABONOS      : 'Abonos3',
  HOJA_PROPIEDADES : 'Propiedades3',
  HOJA_PAQUETES    : 'Paquetes3',
  HOJA_CHECKLIST   : 'Checklist3',

  TOKEN_EXPIRY_HORAS          : 72,
  TOKEN_CONFIGURAR_EXPIRY_DIAS: 7,
  MAX_PROPIEDADES             : 5,

  // Cambiar a false cuando el sistema esté en producción.
  MODO_BORRADOR: false,

  // Llave de autenticación para acciones de administrador.
  ADMIN_KEY: 'framedock',
};

// ─── UTILIDADES DE FECHA Y FORMATO ───────────────────────────────────────────

function formatFechaEspanol3(fechaRaw) {
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const raw = String(fechaRaw);
  const fecha = new Date(raw.includes('T') ? raw : raw + 'T12:00:00');
  if (isNaN(fecha)) return String(fechaRaw);
  let horas  = fecha.getHours();
  const mins = String(fecha.getMinutes()).padStart(2, '0');
  const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
  horas = horas % 12 || 12;
  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} · ${horas}:${mins} ${ampm}`;
}

function generarFolio3(fechaSesion) {
  let d;
  if (fechaSesion) {
    const s = String(fechaSesion).includes('T') ? fechaSesion : fechaSesion + 'T12:00:00';
    d = new Date(s);
  } else {
    d = new Date();
  }
  if (isNaN(d)) return 'IAV-' + Utilities.formatDate(new Date(), 'America/Monterrey', 'yyMM.dd');
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return 'IAV-' + yy + mm + '.' + dd;
}

function formatMXN3(val) {
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0
  }).format(num);
}

function obtenerNombreMes3(numMes) {
  const meses = ['01. Enero','02. Febrero','03. Marzo','04. Abril','05. Mayo','06. Junio',
                 '07. Julio','08. Agosto','09. Septiembre','10. Octubre','11. Noviembre','12. Diciembre'];
  return meses[parseInt(numMes, 10) - 1] || numMes;
}

// ─── HELPERS DE INFRAESTRUCTURA ──────────────────────────────────────────────

function jsonResponse3(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function enviarCorreo3(para, asunto, htmlBody, adjuntos) {
  if (!para || !String(para).trim()) return;
  const opciones = { htmlBody: htmlBody };
  if (adjuntos && adjuntos.length) opciones.attachments = adjuntos;
  if (CONFIG3.MODO_BORRADOR) {
    GmailApp.createDraft(para, asunto, '', opciones);
    Logger.log('BORRADOR -> ' + para + ' | ' + asunto);
  } else {
    MailApp.sendEmail(para, asunto, '', opciones);
    Logger.log('ENVIADO -> ' + para + ' | ' + asunto);
  }
}

function buscarOCrearCarpeta3(nombre, carpetaPadre) {
  const iter = carpetaPadre.getFoldersByName(nombre);
  if (iter.hasNext()) return iter.next();
  return carpetaPadre.createFolder(nombre);
}

// ─── ACCESO A HOJAS ───────────────────────────────────────────────────────────

function getHoja3(nombre) {
  const ss   = SpreadsheetApp.openById(CONFIG3.SHEETS_ID);
  const hoja = ss.getSheetByName(nombre);
  if (!hoja) throw new Error('Hoja no encontrada: ' + nombre);
  return hoja;
}

function getContratosSheet3()   { return getHoja3(CONFIG3.HOJA_CONTRATOS);   }
function getTokensSheet3()      { return getHoja3(CONFIG3.HOJA_TOKENS);      }
function getAbonosSheet3()      { return getHoja3(CONFIG3.HOJA_ABONOS);      }
function getPropiedadesSheet3() { return getHoja3(CONFIG3.HOJA_PROPIEDADES); }
function getPaquetesSheet3()    { return getHoja3(CONFIG3.HOJA_PAQUETES);    }
function getChecklistSheet3()   { return getHoja3(CONFIG3.HOJA_CHECKLIST);   }

// ─── TOKENS ──────────────────────────────────────────────────────────────────

function generarToken3() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 24);
}

function crearToken3(contratoID, tipo) {
  // Para tipo 'contrato': el token ES el contratoID. Esto permite usar el mismo
  // UUID como identificador del contrato y como token de acceso al portal.
  // Para tipo 'configurar': genera un UUID separado para Bruno.
  const token = (tipo === 'contrato') ? contratoID : generarToken3();
  const ahora = new Date();
  let expira  = '';

  if (tipo === 'contrato') {
    expira = new Date(ahora.getTime() + CONFIG3.TOKEN_EXPIRY_HORAS * 60 * 60 * 1000).toISOString();
  } else if (tipo === 'configurar') {
    expira = new Date(ahora.getTime() + CONFIG3.TOKEN_CONFIGURAR_EXPIRY_DIAS * 24 * 60 * 60 * 1000).toISOString();
  }

  getTokensSheet3().appendRow([token, contratoID, tipo, expira, false]);
  return token;
}

function obtenerToken3(token) {
  const hoja  = getTokensSheet3();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === token) {
      return {
        token      : datos[i][0],
        contratoID : datos[i][1],
        tipo       : datos[i][2],
        expira     : datos[i][3],
        usado      : datos[i][4] === true || datos[i][4] === 'TRUE',
        fila       : i + 1,
      };
    }
  }
  return null;
}

function estaTokenVigente3(tokenData) {
  if (!tokenData) return false;
  if (tokenData.usado) return false;
  if (!tokenData.expira) return true; // permanente
  return new Date() < new Date(tokenData.expira);
}

function marcarTokenUsado3(token) {
  const hoja  = getTokensSheet3();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === token) {
      hoja.getRange(i + 1, 5).setValue(true);
      return;
    }
  }
}

function volverTokenPermanente3(token) {
  // Después de que el cliente firma, el token se vuelve permanente.
  // Borra la fecha de expiración y deja Usado en false para permitir
  // que el cliente regrese al portal en cualquier momento.
  const hoja  = getTokensSheet3();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === token) {
      hoja.getRange(i + 1, 4).setValue('');
      hoja.getRange(i + 1, 5).setValue(false);
      return;
    }
  }
}

function refrescarExpiryTokenPortal3(contratoID) {
  // Reinicia la expiración del token de portal a 72h desde ahora.
  // Se llama al terminar guardarConfiguracion para dar tiempo al cliente de firmar.
  const nuevaExpira = new Date(Date.now() + CONFIG3.TOKEN_EXPIRY_HORAS * 60 * 60 * 1000).toISOString();
  const hoja  = getTokensSheet3();
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === contratoID && datos[i][2] === 'contrato') {
      hoja.getRange(i + 1, 4).setValue(nuevaExpira);
      return;
    }
  }
}

function limpiarTokensViejos3() {
  // Trigger semanal. Elimina tokens de tipo 'configurar' usados o vencidos hace más de 30 días.
  const hoja        = getTokensSheet3();
  const datos       = hoja.getDataRange().getValues();
  const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
  const ahora       = Date.now();
  let eliminados    = 0;

  for (let i = datos.length - 1; i >= 1; i--) {
    const tipo  = datos[i][2];
    const expira = datos[i][3];
    if (tipo !== 'configurar') continue;
    if (!expira) continue;
    // Eliminar tokens cuya expiración fue hace más de 30 días.
    if (ahora - new Date(expira).getTime() > TREINTA_DIAS) {
      hoja.deleteRow(i + 1);
      eliminados++;
    }
  }
  Logger.log('limpiarTokensViejos3: ' + eliminados + ' tokens configurar eliminados');

  // Limpiar tokens permanentes de tipo 'contrato' cuyos contratos ya no existen.
  const contratosExistentes = new Set();
  try {
    const datosC = getContratosSheet3().getDataRange().getValues();
    const encC   = datosC[0];
    const colTok = encC.indexOf('Token');
    for (let i = 1; i < datosC.length; i++) {
      if (datosC[i][colTok]) contratosExistentes.add(String(datosC[i][colTok]));
    }
  } catch(e) { Logger.log('limpiarTokensViejos3: error leyendo contratos: ' + e.message); return; }

  const datosT2  = hoja.getDataRange().getValues();
  let eliminadosC = 0;
  for (let i = datosT2.length - 1; i >= 1; i--) {
    if (datosT2[i][2] === 'contrato' && !contratosExistentes.has(String(datosT2[i][1]))) {
      hoja.deleteRow(i + 1);
      eliminadosC++;
    }
  }
  Logger.log('limpiarTokensViejos3: ' + eliminadosC + ' tokens contrato huérfanos eliminados');
}

// ─── CONTRATOS3 ───────────────────────────────────────────────────────────────

const COLS_CONTRATOS3 = [
  'Token','Folio','NombreCliente','CorreoCliente','TelefonoCliente',
  'TipoContrato','TipoPaquete','PaqueteBase','AdicionalesJSON',
  'PrecioBase','PrecioTotal','Anticipo','SaldoPendiente','Estatus',
  'FechaCreacion','FechaFirma','FechaUltimoAbono','FechaEntrega',
  'FirmaBase64URL','EntregaDriveLink','EntregaLinksExtra','NumPropiedades',
  'PdfContratoUrl','NotasContrato','Oculto',
];

function crearFilaContrato3(datos) {
  const fila = COLS_CONTRATOS3.map(col => {
    const v = datos[col] !== undefined ? datos[col] : '';
    return typeof v === 'string' ? sanitizarParaSheets(v) : v;
  });
  getContratosSheet3().appendRow(fila);
}

function obtenerContrato3(token) {
  const hoja  = getContratosSheet3();
  const todas = hoja.getDataRange().getValues();
  const enc   = todas[0];
  for (let i = 1; i < todas.length; i++) {
    if (todas[i][enc.indexOf('Token')] === token) {
      const obj = {};
      enc.forEach((col, j) => { obj[col] = todas[i][j]; });
      obj._fila = i + 1;
      return obj;
    }
  }
  return null;
}

function actualizarContrato3(token, cambios) {
  const hoja  = getContratosSheet3();
  const todas = hoja.getDataRange().getValues();
  const enc   = todas[0];
  for (let i = 1; i < todas.length; i++) {
    if (todas[i][enc.indexOf('Token')] === token) {
      const fila = i + 1;
      Object.keys(cambios).forEach(col => {
        const j = enc.indexOf(col);
        if (j !== -1) hoja.getRange(fila, j + 1).setValue(cambios[col]);
      });
      return true;
    }
  }
  return false;
}

// ─── ABONOS3 ─────────────────────────────────────────────────────────────────

function registrarAbonoFila3(contratoToken, monto, metodo, notas) {
  const id  = generarToken3().substring(0, 12);
  const hoy = new Date();
  getAbonosSheet3().appendRow([
    id, contratoToken, parseFloat(monto), metodo || '', hoy, hoy, notas || ''
  ]);
  return id;
}

function obtenerAbonos3(contratoToken) {
  const hoja  = getAbonosSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const abonos = [];
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][enc.indexOf('ContratoToken')] === contratoToken) {
      const obj = {};
      enc.forEach((col, j) => { obj[col] = datos[i][j]; });
      abonos.push(obj);
    }
  }
  return abonos;
}

// ─── PROPIEDADES3 ────────────────────────────────────────────────────────────

function guardarPropiedades3(contratoToken, propiedades) {
  const hoja     = getPropiedadesSheet3();
  const datos    = hoja.getDataRange().getValues();
  const enc      = datos[0];
  const colToken   = enc.indexOf('ContratoToken');
  const colNum     = enc.indexOf('NumPropiedad');
  const colCarpeta = enc.indexOf('CarpetaControlID');
  const colCalId   = enc.indexOf('CalendarEventID');
  const carpetasGuardadas = {};
  const calIdsGuardados   = {};
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][colToken] === contratoToken) {
      const num = String(datos[i][colNum]);
      if (colCarpeta !== -1 && datos[i][colCarpeta]) carpetasGuardadas[num] = datos[i][colCarpeta];
      if (colCalId   !== -1 && datos[i][colCalId])   calIdsGuardados[num]   = datos[i][colCalId];
    }
  }

  // Construir todas las filas ANTES de modificar el sheet
  const filasNuevas = propiedades.map((p, i) => {
    const fsStr    = p.FechaSesion instanceof Date
      ? p.FechaSesion.toISOString()
      : (p.FechaSesion ? String(p.FechaSesion) : '');
    const fechaObj = fsStr ? new Date(fsStr.includes('T') ? fsStr : fsStr + 'T12:00:00') : null;
    const fecha    = fechaObj && !isNaN(fechaObj) ? fechaObj : '';
    const hora     = p.HoraSesion || (fechaObj && !isNaN(fechaObj)
      ? Utilities.formatDate(fechaObj, 'America/Monterrey', 'HH:mm') : '');
    const numKey    = String(p.NumPropiedad || (i + 1));
    const carpetaID = p.CarpetaControlID || carpetasGuardadas[numKey] || '';
    const calId     = p.CalendarEventID  || calIdsGuardados[numKey]   || '';
    return [
      contratoToken,
      p.NumPropiedad || (i + 1),
      p.Tipo              || '',
      p.Paquete           || '',
      p.Entregables       || '',
      fecha,
      hora,
      p.Direccion         || '',
      p.LinkMaps          || '',
      p.Orientacion       || '',
      p.SobreLaPropiedad  || '',
      JSON.stringify(p.DatosEspecificos || {}),
      p.LogoURL           || '',
      carpetaID,
      calId,
    ];
  });

  // Ahora sí modificar el sheet: borrar filas antiguas de abajo hacia arriba
  for (let i = datos.length - 1; i >= 1; i--) {
    if (datos[i][colToken] === contratoToken) hoja.deleteRow(i + 1);
  }

  // Insertar en bloque (más seguro que appendRow individual)
  if (filasNuevas.length > 0) {
    hoja.getRange(hoja.getLastRow() + 1, 1, filasNuevas.length, filasNuevas[0].length)
        .setValues(filasNuevas);
  }
}

function actualizarPropiedad3(contratoToken, numPropiedad, cambios) {
  const hoja   = getPropiedadesSheet3();
  const datos  = hoja.getDataRange().getValues();
  const enc    = datos[0];
  const colTok = enc.indexOf('ContratoToken');
  const colNum = enc.indexOf('NumPropiedad');
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][colTok] === contratoToken && datos[i][colNum] == numPropiedad) {
      Object.keys(cambios).forEach(col => {
        const j = enc.indexOf(col);
        if (j !== -1) hoja.getRange(i + 1, j + 1).setValue(cambios[col]);
      });
      return true;
    }
  }
  return false;
}

function obtenerPropiedades3(contratoToken) {
  const hoja     = getPropiedadesSheet3();
  const datos    = hoja.getDataRange().getValues();
  const enc      = datos[0];
  const colToken = enc.indexOf('ContratoToken');
  const props    = [];
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][colToken] === contratoToken) {
      const obj = {};
      enc.forEach((col, j) => { obj[col] = datos[i][j]; });
      try { obj.DatosEspecificos = JSON.parse(obj.DatosEspecificos || '{}'); } catch(e) { obj.DatosEspecificos = {}; }
      props.push(obj);
    }
  }
  props.sort((a, b) => (a.NumPropiedad || 0) - (b.NumPropiedad || 0));
  return props;
}

// ─── PAQUETES3 ────────────────────────────────────────────────────────────────

function esSi3(val) {
  if (val === true || val === 1) return true;
  const s = String(val).trim().toUpperCase();
  return s === 'SI' || s === 'SÍ' || s === 'TRUE' || s === 'YES' || s === '1';
}

function obtenerPaquetesActivos3(filtroTipo) {
  const hoja     = getPaquetesSheet3();
  const datos    = hoja.getDataRange().getValues();
  const enc      = datos[0];
  const paquetes = [];
  for (let i = 1; i < datos.length; i++) {
    const fila = {};
    enc.forEach((col, j) => { fila[col] = datos[i][j]; });
    if (!esSi3(fila.Activo)) continue;
    if (filtroTipo && fila.Tipo !== filtroTipo && fila.Tipo !== 'Ambos') continue;
    fila.Precio      = parseFloat(fila.Precio) || 0;
    fila.EsAdicional = esSi3(fila.EsAdicional);
    paquetes.push(fila);
  }
  paquetes.sort((a, b) => (a.Orden || 0) - (b.Orden || 0));
  return paquetes;
}

function obtenerPaquete3ByClave(clave) {
  return obtenerPaquetesActivos3(null).find(p => p.Clave === clave) || null;
}

// ─── ROUTING ─────────────────────────────────────────────────────────────────

const ACCIONES_ADMIN_GET3 = new Set([
  'listarContratos','listarClientes','listarStats','obtenerContrato',
  'listarPaquetesTodos','exportarCSV',
]);

function doGet(e) {
  const accion = (e.parameter.action || '').trim();
  try {
    if (ACCIONES_ADMIN_GET3.has(accion) && e.parameter.adminKey !== CONFIG3.ADMIN_KEY) {
      return jsonResponse3({ error: 'No autorizado' });
    }
    if (accion === 'listarContratos')    return accionListarContratos3(e);
    if (accion === 'listarClientes')    return accionListarClientes3(e);
    if (accion === 'listarPaquetes')    return accionListarPaquetes3(e);
    if (accion === 'listarPaquetesTodos') return accionListarPaquetesTodos3();
    if (accion === 'obtenerContrato')   return accionObtenerContrato3(e);
    if (accion === 'obtenerPortal')     return accionObtenerPortal3(e);
    if (accion === 'listarStats')       return accionListarStats3(e);
    if (accion === 'obtenerChecklist')  return accionObtenerChecklist3(e);
    if (accion === 'exportarCSV')       return accionExportarCSV3(e);
    return jsonResponse3({ error: 'Acción GET no reconocida: ' + accion });
  } catch (err) {
    Logger.log('ERROR doGet [' + accion + ']: ' + err.message);
    return jsonResponse3({ error: err.message });
  }
}

// Acciones que requieren clave de administrador.
const ACCIONES_ADMIN3 = new Set([
  'crearContrato','registrarAbono','actualizarEstatus','guardarEntrega',
  'crearPaquete','editarPaquete','togglePaquete',
  'ocultarContrato','eliminarContrato','reagendarPropiedad',
  'enviarRecordatorio','guardarNotaPropiedad',
]);

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const accion = (body.action || '').trim();

    if (ACCIONES_ADMIN3.has(accion) && body.adminKey !== CONFIG3.ADMIN_KEY) {
      return jsonResponse3({ error: 'No autorizado' });
    }

    if (accion === 'crearContrato')        return accionCrearContrato3(body);
    if (accion === 'manejarFirmaCliente')  return accionManejarFirmaCliente3(body);
    if (accion === 'guardarConfiguracion') return accionGuardarConfiguracion3(body);
    if (accion === 'registrarAbono')       return accionRegistrarAbono3(body);
    if (accion === 'actualizarEstatus')    return accionActualizarEstatus3(body);
    if (accion === 'guardarEntrega')       return accionGuardarEntrega3(body);
    if (accion === 'crearPaquete')         return accionCrearPaquete3(body);
    if (accion === 'editarPaquete')        return accionEditarPaquete3(body);
    if (accion === 'togglePaquete')        return accionTogglePaquete3(body);
    if (accion === 'subirArchivo')         return accionSubirArchivo3(body);
    if (accion === 'ocultarContrato')      return accionOcultarContrato3(body);
    if (accion === 'eliminarContrato')     return accionEliminarContrato3(body);
    if (accion === 'reagendarPropiedad')   return accionReagendarPropiedad3(body);
    if (accion === 'guardarChecklist')     return accionGuardarChecklist3(body);
    if (accion === 'enviarRecordatorio')   return accionEnviarRecordatorio3(body);
    if (accion === 'guardarNotaPropiedad') return accionGuardarNotaPropiedad3(body);
    return jsonResponse3({ error: 'Acción POST no reconocida: ' + accion });
  } catch (err) {
    Logger.log('ERROR doPost: ' + err.message);
    return jsonResponse3({ error: err.message });
  }
}

// ─── ENDPOINT: crearContrato ──────────────────────────────────────────────────

function accionCrearContrato3(body) {
  const tipo     = (body.tipoContrato    || 'estandar').toLowerCase();
  const nombre   = (body.nombreCliente   || '').trim();
  const correo   = (body.correoCliente   || '').trim();
  const telefono = (body.telefonoCliente || '').trim();

  if (!nombre) {
    return jsonResponse3({ error: 'El nombre del cliente es obligatorio' });
  }

  const precioBase  = parseFloat(body.precioBase)  || 0;
  const precioTotal = parseFloat(body.precioTotal) || precioBase;
  if (precioTotal <= 0) return jsonResponse3({ error: 'El precio total debe ser mayor a cero' });
  const anticipo    = body.anticipo !== undefined && body.anticipo !== '' ? parseFloat(body.anticipo) || 0 : Math.round(precioTotal * 0.5);

  const contratoToken = generarToken3();
  const fechaCreacion = new Date().toISOString();

  let folio                  = '';
  let paqueteBase            = '';
  let tipoPaquete            = '';
  let adicionales            = '[]';
  let numProps               = 1;
  let urlRespuesta           = '';
  let propiedadesParaGuardar = [];

  if (tipo === 'estandar') {
    paqueteBase  = body.paqueteBase || '';
    adicionales  = JSON.stringify(body.adicionales || []);
    tipoPaquete  = paqueteBase.startsWith('TER') ? 'Terreno' : 'Residencial';
    folio        = generarFolio3(body.fechaSesion || '');

    const paqueteDatos    = obtenerPaquete3ByClave(paqueteBase);
    const entregablesBase = paqueteDatos ? paqueteDatos.Entregables : '';

    propiedadesParaGuardar = [{
      Tipo             : tipoPaquete,
      Paquete          : paqueteDatos ? paqueteDatos.Nombre : paqueteBase,
      Entregables      : entregablesBase,
      FechaSesion      : body.fechaSesion || '',
      HoraSesion       : body.horaSesion  || '',
      Direccion        : '',
      LinkMaps         : '',
      Orientacion      : '',
      SobreLaPropiedad : '',
      DatosEspecificos : {},
    }];

    urlRespuesta = CONFIG3.BASE_URL_PORTAL + '?token=' + contratoToken;

  } else {
    numProps    = parseInt(body.numPropiedades, 10) || 1;
    tipoPaquete = '';
    paqueteBase = '';
    adicionales = JSON.stringify(body.adicionales || []);

    const propsConfig  = body.propiedadesConfig || [];
    const propsParData = [];
    for (var pi = 0; pi < numProps; pi++) {
      var cfg = propsConfig[pi] || {};
      propsParData.push({
        Tipo             : cfg.tipo        || 'Residencial',
        Paquete          : cfg.paquete     || '',
        Entregables      : cfg.entregables || '',
        FechaSesion      : cfg.fechaSesion || '',
        HoraSesion       : cfg.horaSesion  || '',
        Direccion        : '',
        LinkMaps         : '',
        Orientacion      : '',
        SobreLaPropiedad : '',
        DatosEspecificos : {},
      });
    }
    propiedadesParaGuardar = propsParData;
    folio = generarFolio3((propsConfig[0] || {}).fechaSesion || '');
    urlRespuesta = CONFIG3.BASE_URL_PORTAL + '?token=' + contratoToken;
  }

  // Crear la fila del contrato PRIMERO para evitar propiedades huérfanas si falla.
  crearFilaContrato3({
    Token          : contratoToken,
    Folio          : folio,
    NombreCliente  : nombre,
    CorreoCliente  : correo,
    TelefonoCliente: telefono,
    TipoContrato   : tipo,
    TipoPaquete    : tipoPaquete,
    PaqueteBase    : paqueteBase,
    AdicionalesJSON: adicionales,
    PrecioBase     : precioBase,
    PrecioTotal    : precioTotal,
    Anticipo       : anticipo,
    SaldoPendiente : precioTotal,
    Estatus        : 'Pendiente firma',
    FechaCreacion  : fechaCreacion,
    NumPropiedades : numProps,
    NotasContrato  : body.notasContrato || '',
  });

  // Token de portal para el cliente
  crearToken3(contratoToken, 'contrato');

  // Guardar propiedades DESPUÉS de crear el contrato (evita huérfanas si falla crearFilaContrato3)
  guardarPropiedades3(contratoToken, propiedadesParaGuardar);

  Logger.log('Contrato creado: ' + nombre + ' | token: ' + contratoToken + ' | tipo: ' + tipo);
  return jsonResponse3({ ok: true, url: urlRespuesta, token: contratoToken });
}

// ─── ENDPOINT: listarContratos ────────────────────────────────────────────────

function accionListarContratos3(e) {
  const filtroEstatus = e.parameter.estatus || '';
  const filtroBuscar  = (e.parameter.buscar || '').toLowerCase();

  const hoja  = getContratosSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];

  // Construir mapa token → fechaSesion (primera propiedad)
  const fechaSesionMap = {};
  try {
    const hojaProp  = getPropiedadesSheet3();
    const datosProp = hojaProp.getDataRange().getValues();
    const encProp   = datosProp[0];
    const iColTok   = encProp.indexOf('ContratoToken');
    const iColFecha = encProp.indexOf('FechaSesion');
    const iColNum   = encProp.indexOf('NumPropiedad');
    if (iColTok !== -1 && iColFecha !== -1) {
      for (let i = 1; i < datosProp.length; i++) {
        const tok   = datosProp[i][iColTok];
        const num   = parseInt(datosProp[i][iColNum]) || 1;
        const fecha = datosProp[i][iColFecha];
        if (tok && fecha && (!fechaSesionMap[tok] || num === 1)) {
          fechaSesionMap[tok] = fecha;
        }
      }
    }
  } catch(e) { /* continuar sin fechaSesion si falla */ }

  const contratos = [];
  for (let i = 1; i < datos.length; i++) {
    const fila = {};
    enc.forEach((col, j) => { fila[col] = datos[i][j]; });
    if (!fila.Token) continue;
    if (esSi3(fila.Oculto)) continue;
    if (filtroEstatus && fila.Estatus !== filtroEstatus) continue;
    if (filtroBuscar) {
      const texto = (fila.NombreCliente + fila.CorreoCliente + fila.Folio).toLowerCase();
      if (!texto.includes(filtroBuscar)) continue;
    }
    contratos.push({
      token          : fila.Token,
      folio          : fila.Folio,
      nombre         : fila.NombreCliente,
      correo         : fila.CorreoCliente,
      telefono       : fila.TelefonoCliente,
      estatus        : fila.Estatus,
      precioTotal    : fila.PrecioTotal,
      saldoPendiente : fila.SaldoPendiente,
      fechaCreacion  : fila.FechaCreacion,
      fechaSesion    : fechaSesionMap[fila.Token] || '',
      tipoContrato   : fila.TipoContrato,
      tipoPaquete    : fila.TipoPaquete,
    });
  }
  contratos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  return jsonResponse3({ ok: true, contratos: contratos });
}

// ─── ENDPOINT: listarClientes ─────────────────────────────────────────────────

function accionListarClientes3(e) {
  const hoja  = getContratosSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const mapa  = {};

  for (let i = 1; i < datos.length; i++) {
    const fila = {};
    enc.forEach((col, j) => { fila[col] = datos[i][j]; });
    if (!fila.CorreoCliente) continue;
    if (esSi3(fila.Oculto)) continue;
    const key = fila.CorreoCliente.toLowerCase().trim();
    if (!mapa[key]) {
      mapa[key] = {
        nombre   : fila.NombreCliente,
        correo   : fila.CorreoCliente,
        telefono : fila.TelefonoCliente,
        proyectos: [],
      };
    }
    mapa[key].proyectos.push({
      folio      : fila.Folio,
      estatus    : fila.Estatus,
      precioTotal: fila.PrecioTotal,
      fecha      : fila.FechaCreacion,
    });
  }

  const clientes = Object.values(mapa);
  clientes.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return jsonResponse3({ ok: true, clientes: clientes });
}

// ─── ENDPOINT: listarPaquetes ─────────────────────────────────────────────────

function accionListarPaquetes3(e) {
  const tipo     = e.parameter.tipo || null;
  const paquetes = obtenerPaquetesActivos3(tipo);
  return jsonResponse3({ ok: true, paquetes: paquetes });
}

// ─── ENDPOINT: listarPaquetesTodos ────────────────────────────────────────────

function accionListarPaquetesTodos3() {
  const hoja  = getPaquetesSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const todos = [];
  for (var i = 1; i < datos.length; i++) {
    const fila = {};
    enc.forEach(function(col, j) { fila[col] = datos[i][j]; });
    fila.Precio      = parseFloat(fila.Precio) || 0;
    fila.EsAdicional = esSi3(fila.EsAdicional);
    fila.Activo      = esSi3(fila.Activo);
    todos.push(fila);
  }
  todos.sort(function(a, b) { return (a.Orden || 0) - (b.Orden || 0); });
  return jsonResponse3({ ok: true, paquetes: todos });
}

// ─── ENDPOINT: crearPaquete ───────────────────────────────────────────────────

function accionCrearPaquete3(body) {
  const clave = (body.clave || '').trim().toUpperCase();
  if (!clave) return jsonResponse3({ ok: false, error: 'Clave requerida' });

  const hoja  = getPaquetesSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];

  // Verificar que la clave no exista
  const colClave = enc.indexOf('Clave');
  if (colClave >= 0) {
    for (var i = 1; i < datos.length; i++) {
      if (String(datos[i][colClave]).trim().toUpperCase() === clave) {
        return jsonResponse3({ ok: false, error: 'Ya existe un paquete con esa clave' });
      }
    }
  }

  const nuevaFila = enc.map(function(col) {
    switch (col) {
      case 'Clave':        return clave;
      case 'Nombre':       return body.nombre || '';
      case 'Tipo':         return body.tipo    || 'Ambos';
      case 'Precio':       return parseFloat(body.precio) || 0;
      case 'Entregables':  return body.entregables || '';
      case 'EsAdicional':  return body.esAdicional ? 'Sí' : 'No';
      case 'Activo':       return body.activo !== false ? 'Sí' : 'No';
      case 'Orden':        return body.orden !== undefined ? parseInt(body.orden) : 0;
      default:             return '';
    }
  });
  hoja.appendRow(nuevaFila);
  return jsonResponse3({ ok: true });
}

// ─── ENDPOINT: editarPaquete ──────────────────────────────────────────────────

function accionEditarPaquete3(body) {
  const claveOrig = (body.claveOriginal || '').trim().toUpperCase();
  const claveNueva = (body.clave || '').trim().toUpperCase();
  if (!claveOrig) return jsonResponse3({ ok: false, error: 'claveOriginal requerida' });

  const hoja  = getPaquetesSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const colClave = enc.indexOf('Clave');
  if (colClave < 0) return jsonResponse3({ ok: false, error: 'Columna Clave no encontrada' });

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colClave]).trim().toUpperCase() === claveOrig) {
      enc.forEach(function(col, j) {
        switch (col) {
          case 'Clave':        hoja.getRange(i + 1, j + 1).setValue(claveNueva || claveOrig); break;
          case 'Nombre':       hoja.getRange(i + 1, j + 1).setValue(body.nombre || ''); break;
          case 'Tipo':         hoja.getRange(i + 1, j + 1).setValue(body.tipo   || 'Ambos'); break;
          case 'Precio':       hoja.getRange(i + 1, j + 1).setValue(parseFloat(body.precio) || 0); break;
          case 'Entregables':  hoja.getRange(i + 1, j + 1).setValue(body.entregables || ''); break;
          case 'EsAdicional':  hoja.getRange(i + 1, j + 1).setValue(body.esAdicional ? 'Sí' : 'No'); break;
        }
      });
      return jsonResponse3({ ok: true });
    }
  }
  return jsonResponse3({ ok: false, error: 'Paquete no encontrado: ' + claveOrig });
}

// ─── ENDPOINT: togglePaquete ──────────────────────────────────────────────────

function accionTogglePaquete3(body) {
  const clave  = (body.clave || '').trim().toUpperCase();
  const activo = body.activo !== false;
  if (!clave) return jsonResponse3({ ok: false, error: 'Clave requerida' });

  const hoja  = getPaquetesSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const colClave  = enc.indexOf('Clave');
  const colActivo = enc.indexOf('Activo');
  if (colClave < 0 || colActivo < 0) return jsonResponse3({ ok: false, error: 'Columnas no encontradas' });

  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colClave]).trim().toUpperCase() === clave) {
      hoja.getRange(i + 1, colActivo + 1).setValue(activo ? 'Sí' : 'No');
      return jsonResponse3({ ok: true });
    }
  }
  return jsonResponse3({ ok: false, error: 'Paquete no encontrado: ' + clave });
}

// ─── ENDPOINT: obtenerContrato ────────────────────────────────────────────────

function accionObtenerContrato3(e) {
  const token = e.parameter.token || '';
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  const props        = obtenerPropiedades3(token);
  const abonos       = obtenerAbonos3(token);
  const totalAbonado = abonos.reduce((s, a) => s + (parseFloat(a.Monto) || 0), 0);

  let adicionales = [];
  try { adicionales = JSON.parse(contrato.AdicionalesJSON || '[]'); } catch(e) { }

  return jsonResponse3({
    ok          : true,
    contrato    : contrato,
    propiedades : props.map(p => ({
      numPropiedad     : p.NumPropiedad,
      tipo             : p.Tipo,
      paquete          : p.Paquete,
      entregables      : p.Entregables,
      fechaSesion      : p.FechaSesion,
      horaSesion       : p.HoraSesion,
      direccion        : p.Direccion,
      linkMaps         : p.LinkMaps,
      orientacion      : p.Orientacion,
      sobreLaPropiedad : p.SobreLaPropiedad,
      datosEspecificos : p.DatosEspecificos,
      notaInterna      : p.NotaInterna || '',
    })),
    abonos      : abonos.map(a => ({
      id    : a.ID,
      monto : a.Monto,
      metodo: a.Metodo,
      fecha : a.Fecha,
      notas : a.Notas,
    })),
    totalAbonado: totalAbonado,
    adicionales : adicionales,
  });
}

// ─── ENDPOINT: obtenerPortal ──────────────────────────────────────────────────

function accionObtenerPortal3(e) {
  const token = e.parameter.token || '';
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  const tokenData = obtenerToken3(token);
  if (!tokenData) return jsonResponse3({ error: 'Token inválido' });

  const contrato = obtenerContrato3(tokenData.contratoID);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  // Antes de la firma se verifica vigencia. Después es permanente.
  const pendienteFirma = contrato.Estatus === 'Pendiente firma';
  if (pendienteFirma && !estaTokenVigente3(tokenData)) {
    return jsonResponse3({ error: 'El enlace ha expirado. Solicita uno nuevo a Inmuebles Audiovisuales.' });
  }

  const props        = obtenerPropiedades3(tokenData.contratoID);
  const abonos       = obtenerAbonos3(tokenData.contratoID);
  const totalAbonado = abonos.reduce((s, a) => s + (parseFloat(a.Monto) || 0), 0);

  let adicionales = [];
  try { adicionales = JSON.parse(contrato.AdicionalesJSON || '[]'); } catch(e) { }

  let paquetesDisponibles = [];
  if (pendienteFirma) {
    // Mostrar solo los add-ons que Bruno seleccionó para este cliente.
    // Si no se guardó ninguno, mostrar todos los disponibles por tipo.
    if (adicionales.length > 0) {
      paquetesDisponibles = adicionales
        .map(clave => obtenerPaquete3ByClave(clave))
        .filter(Boolean);
    } else {
      const tipo = contrato.TipoPaquete || '';
      paquetesDisponibles = obtenerPaquetesActivos3(tipo || null).filter(p => p.EsAdicional);
    }
  }

  return jsonResponse3({
    ok                 : true,
    estatus            : contrato.Estatus,
    folio              : contrato.Folio,
    nombre             : contrato.NombreCliente,
    correo             : contrato.CorreoCliente,
    telefono           : contrato.TelefonoCliente,
    tipoContrato       : contrato.TipoContrato,
    tipoPaquete        : contrato.TipoPaquete,
    paqueteBase        : contrato.PaqueteBase,
    adicionales        : adicionales,
    precioBase         : contrato.PrecioBase,
    precioTotal        : contrato.PrecioTotal,
    anticipo           : contrato.Anticipo,
    saldoPendiente     : contrato.SaldoPendiente,
    numPropiedades     : contrato.NumPropiedades,
    propiedades        : props.map(p => ({
      numPropiedad     : p.NumPropiedad,
      tipo             : p.Tipo,
      paquete          : p.Paquete,
      entregables      : p.Entregables,
      fechaSesion      : p.FechaSesion,
      horaSesion       : p.HoraSesion,
      direccion        : p.Direccion,
      linkMaps         : p.LinkMaps,
      orientacion      : p.Orientacion,
      sobreLaPropiedad : p.SobreLaPropiedad,
      datosEspecificos : p.DatosEspecificos,
    })),
    abonos             : abonos.map(a => ({
      monto : a.Monto,
      metodo: a.Metodo,
      fecha : a.Fecha,
    })),
    totalAbonado       : totalAbonado,
    entregaDriveLink   : contrato.EntregaDriveLink  || '',
    entregaLinksExtra  : contrato.EntregaLinksExtra || '',
    pdfContratoUrl     : contrato.PdfContratoUrl    || '',
    notasContrato      : contrato.NotasContrato     || '',
    paquetesDisponibles: paquetesDisponibles,
    waLink             : CONFIG3.WA_LINK,
    clipLink           : CONFIG3.CLIP_LINK,
    clabe              : CONFIG3.CLABE,
    cuenta             : CONFIG3.CUENTA,
    banco              : CONFIG3.BANCO,
    titular            : CONFIG3.TITULAR,
  });
}

// ─── GENERACION DE PDF DEL CONTRATO ──────────────────────────────────────────

function embebeFirmaEnDoc3(body, firmaBase64) {
  // Reemplaza el marcador {{firma}} con la imagen de la firma del cliente.
  try {
    const base64Data = firmaBase64.replace(/^data:image\/\w+;base64,/, '');
    const imgBlob    = Utilities.newBlob(
      Utilities.base64Decode(base64Data), 'image/png', 'firma.png'
    );
    const found = body.findText('\\{\\{firma\\}\\}');
    if (!found) return;
    const para = found.getElement().getParent();
    const idx  = body.getChildIndex(para);
    body.replaceText('\\{\\{firma\\}\\}', '');
    body.insertImage(idx, imgBlob).setWidth(200).setHeight(75);
  } catch (err) {
    Logger.log('embebeFirmaEnDoc3: ' + err.message);
  }
}

function generarPDFContrato3(contrato, props, firmaBase64) {
  const carpeta  = DriveApp.getFolderById(CONFIG3.CARPETA_PROYECTOS_ID);
  const template = DriveApp.getFileById(CONFIG3.TEMPLATE_CONTRATO_ID);
  const copia    = template.makeCopy('CONTRATO_TEMP_' + contrato.NombreCliente, carpeta);

  try {
    const doc  = DocumentApp.openById(copia.getId());
    const body = doc.getBody();

    const fechaHoy = Utilities.formatDate(new Date(), 'America/Monterrey', 'dd/MM/yyyy');
    body.replaceText('\\{\\{fechaContrato\\}\\}', fechaHoy);
    body.replaceText('\\{\\{folio\\}\\}',          contrato.Folio           || '');
    body.replaceText('\\{\\{nombre\\}\\}',         contrato.NombreCliente   || '');
    body.replaceText('\\{\\{correo\\}\\}',         contrato.CorreoCliente   || '');
    body.replaceText('\\{\\{telefono\\}\\}',       contrato.TelefonoCliente || '');
    body.replaceText('\\{\\{precio\\}\\}',         formatMXN3(contrato.PrecioTotal));
    body.replaceText('\\{\\{precioTotal\\}\\}',    formatMXN3(contrato.PrecioTotal));
    body.replaceText('\\{\\{anticipo\\}\\}',       formatMXN3(contrato.Anticipo));

    const saldoContrato = Math.max(0, (parseFloat(contrato.PrecioTotal) || 0) - (parseFloat(contrato.Anticipo) || 0));
    body.replaceText('\\{\\{saldoPendiente\\}\\}', formatMXN3(saldoContrato));

    let adicionalesNombres = '—';
    try {
      const addClaves = JSON.parse(contrato.AdicionalesJSON || '[]');
      if (addClaves.length > 0) {
        const nombres = addClaves.map(clave => {
          const pkg = obtenerPaquete3ByClave(clave);
          return pkg ? pkg.Nombre : clave;
        });
        adicionalesNombres = nombres.join(', ');
      } else {
        adicionalesNombres = 'Ninguno';
      }
    } catch(e) { adicionalesNombres = 'Ninguno'; }
    body.replaceText('\\{\\{adicionales\\}\\}', adicionalesNombres);

    if (props.length === 1) {
      const p = props[0];
      body.replaceText('\\{\\{paquete\\}\\}',     p.Paquete                           || '—');
      body.replaceText('\\{\\{fechaSesion\\}\\}', formatFechaEspanol3(p.FechaSesion)  || '—');
      body.replaceText('\\{\\{direccion\\}\\}',   p.Direccion                          || '—');
      body.replaceText('\\{\\{entregables\\}\\}', p.Entregables                        || '—');
    } else {
      let paqStr = '', fechaStr = '', dirStr = '', entStr = '';
      props.forEach((p, i) => {
        const label = 'Propiedad ' + (i + 1) + ': ';
        paqStr   += label + (p.Paquete   || '—') + '\n';
        fechaStr += label + (formatFechaEspanol3(p.FechaSesion) || '—') + '\n';
        dirStr   += label + (p.Direccion || '—') + '\n';
        entStr   += label + (p.Entregables || '—') + '\n';
      });
      body.replaceText('\\{\\{paquete\\}\\}',     paqStr.trim());
      body.replaceText('\\{\\{fechaSesion\\}\\}', fechaStr.trim());
      body.replaceText('\\{\\{direccion\\}\\}',   dirStr.trim());
      body.replaceText('\\{\\{entregables\\}\\}', entStr.trim());
    }

    if (firmaBase64) embebeFirmaEnDoc3(body, firmaBase64);

    doc.saveAndClose();

    const pdfBlob = DriveApp.getFileById(copia.getId())
      .getAs('application/pdf')
      .setName('Contrato — ' + contrato.NombreCliente + '.pdf');

    return pdfBlob;

  } finally {
    try { copia.setTrashed(true); } catch(e) { }
  }
}

// ─── ENDPOINT: manejarFirmaCliente ───────────────────────────────────────────

function accionManejarFirmaCliente3(body) {
  const token = body.token || '';
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  let contratoActualizado = null;
  let propsMerge          = [];
  let precioTotal         = 0;
  let anticipo            = 0;
  let firmaBase64         = '';
  let tokenID             = '';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const tokenData = obtenerToken3(token);
    if (!tokenData) return jsonResponse3({ error: 'Token inválido' });
    if (tokenData.tipo !== 'contrato') return jsonResponse3({ error: 'Token de tipo incorrecto' });

    const contrato = obtenerContrato3(tokenData.contratoID);
    if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

    if (contrato.Estatus !== 'Pendiente firma') {
      return jsonResponse3({ error: 'Este contrato ya fue firmado' });
    }
    if (!estaTokenVigente3(tokenData)) {
      return jsonResponse3({ error: 'El enlace ha expirado. Solicita uno nuevo a Inmuebles Audiovisuales.' });
    }

    tokenID       = tokenData.contratoID;
    firmaBase64   = body.firmaBase64   || '';
    const propiedadesBody = body.propiedades || [];
    // Los contratos particulares no tienen add-ons; ignorar cualquier valor enviado.
    const adicionalesBody = contrato.TipoContrato === 'particular' ? [] : (body.adicionales || []);

    // Recalcular precio con los adicionales que el cliente seleccionó en el portal.
    const precioBase        = parseFloat(contrato.PrecioBase)  || 0;
    const precioTotalOrigen = parseFloat(contrato.PrecioTotal) || precioBase;
    let precioAdd = 0;
    adicionalesBody.forEach(clave => {
      const pkg = obtenerPaquete3ByClave(clave);
      if (pkg) precioAdd += pkg.Precio;
    });
    precioTotal = precioTotalOrigen + precioAdd;
    // Preservar el anticipo personalizado de Bruno cuando no hay add-ons nuevos.
    anticipo = precioAdd > 0
      ? Math.round(precioTotal * 0.5)
      : parseFloat(contrato.Anticipo) || 0;

    const cambios = {};
    if (body.nombreCliente)   cambios.NombreCliente   = body.nombreCliente.trim();
    if (body.correoCliente)   cambios.CorreoCliente   = body.correoCliente.trim();
    if (body.telefonoCliente) cambios.TelefonoCliente = body.telefonoCliente.trim();
    cambios.AdicionalesJSON = JSON.stringify(adicionalesBody);
    cambios.PrecioTotal     = precioTotal;
    cambios.Anticipo        = anticipo;
    cambios.SaldoPendiente  = precioTotal;
    cambios.Estatus         = 'Firmado';
    cambios.FechaFirma      = new Date().toISOString();

    actualizarContrato3(tokenID, cambios);

    // Actualizar propiedades con los datos que el cliente llenó en el formulario
    const propsExistentes = obtenerPropiedades3(tokenID);
    const addEntregables  = adicionalesBody
      .map(clave => obtenerPaquete3ByClave(clave))
      .filter(Boolean)
      .map(p => p.Entregables)
      .filter(Boolean)
      .join(' · ');
    propsMerge = propsExistentes.map((p, i) => {
      const c              = propiedadesBody[i] || {};
      const entregablesFinal = (p.Entregables || '') + (addEntregables ? ' · ' + addEntregables : '');
      // Combinar DatosEspecificos existentes con los del cliente; preservar referencias.
      const datosMerge = Object.assign({}, p.DatosEspecificos || {}, c.datosEspecificos || {});
      if (c.referencias) datosMerge.referencias = c.referencias;
      return Object.assign({}, p, {
        Direccion        : c.direccion        || p.Direccion        || '',
        LinkMaps         : c.linkMaps         || p.LinkMaps         || '',
        Orientacion      : c.orientacion      || p.Orientacion      || '',
        SobreLaPropiedad : c.sobreLaPropiedad || p.SobreLaPropiedad || '',
        LogoURL          : c.logoUrl          || p.LogoURL          || '',
        DatosEspecificos : datosMerge,
        Entregables      : entregablesFinal,
      });
    });
    guardarPropiedades3(tokenID, propsMerge);

    // El token se vuelve permanente para el ciclo de vida completo
    volverTokenPermanente3(token);

    contratoActualizado = obtenerContrato3(tokenID);
  } finally {
    lock.releaseLock();
  }

  // Operaciones lentas fuera del lock: PDF, Drive, correos.
  let pdfBlob = null;
  try {
    pdfBlob = generarPDFContrato3(contratoActualizado, propsMerge, firmaBase64);
  } catch (err) {
    Logger.log('Error generando PDF del contrato: ' + err.message);
    enviarCorreo3(
      CONFIG3.BRUNO_EMAIL,
      'Error generando PDF — ' + contratoActualizado.NombreCliente,
      '<p style="font-family:sans-serif">No se pudo generar el PDF del contrato firmado por <strong>' +
        contratoActualizado.NombreCliente + '</strong>.</p>' +
        '<p>Folio: ' + (contratoActualizado.Folio || '—') + '</p>' +
        '<p>Error: ' + err.message + '</p>',
      []
    );
  }

  // Guardar PDF en Drive para que el cliente pueda descargarlo desde el portal
  if (pdfBlob) {
    try {
      const carpetaRaiz       = DriveApp.getFolderById(CONFIG3.CARPETA_PROYECTOS_ID);
      const carpetaContratos  = buscarOCrearCarpeta3('Contratos Firmados', carpetaRaiz);
      const nombreArchivo     = (contratoActualizado.Folio || contratoActualizado.NombreCliente) + ' - Contrato.pdf';
      const archivo           = carpetaContratos.createFile(pdfBlob.setName(nombreArchivo));
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      actualizarContrato3(tokenID, { PdfContratoUrl: archivo.getDownloadUrl() });
    } catch(err) {
      Logger.log('Error guardando PDF en Drive: ' + err.message);
      enviarCorreo3(
        CONFIG3.BRUNO_EMAIL,
        'Error al guardar PDF en Drive — ' + contratoActualizado.NombreCliente,
        '<p>El contrato de <strong>' + contratoActualizado.NombreCliente + '</strong> (' + (contratoActualizado.Folio || token) + ') se firmó correctamente, pero el PDF no pudo guardarse en Drive.</p><p>El cliente recibió el PDF adjunto por correo. Para activar el botón de descarga en el portal, sube el PDF manualmente a Drive y pega la URL en la columna <code>PdfContratoUrl</code> de la hoja Contratos3.</p><p>Error: ' + err.message + '</p>',
        []
      );
    }
  }

  enviarCorreo3(
    contratoActualizado.CorreoCliente,
    'Tu contrato con Inmuebles Audiovisuales',
    correoContratoCliente3(contratoActualizado, propsMerge, token, !!pdfBlob),
    pdfBlob ? [pdfBlob] : []
  );

  enviarCorreo3(
    CONFIG3.BRUNO_EMAIL,
    'Contrato firmado — ' + contratoActualizado.NombreCliente,
    correoContratoFirmadoBruno3(contratoActualizado),
    []
  );

  Logger.log('Firma procesada: ' + contratoActualizado.NombreCliente + ' | folio: ' + contratoActualizado.Folio);
  return jsonResponse3({
    ok      : true,
    folio   : contratoActualizado.Folio,
    total   : precioTotal,
    anticipo: anticipo,
  });
}

// ─── ENDPOINT: guardarConfiguracion ──────────────────────────────────────────

function accionGuardarConfiguracion3(body) {
  const token = body.token || '';
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  const tokenData = obtenerToken3(token);
  if (!tokenData) return jsonResponse3({ error: 'Token inválido' });
  if (tokenData.tipo !== 'configurar') return jsonResponse3({ error: 'Token de tipo incorrecto' });
  if (!estaTokenVigente3(tokenData))   return jsonResponse3({ error: 'El enlace ha expirado' });

  const contratoToken = tokenData.contratoID;
  const contrato      = obtenerContrato3(contratoToken);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  const propiedades = body.propiedades || [];
  if (!propiedades.length) return jsonResponse3({ error: 'Se requiere al menos una propiedad' });

  // Leer propiedades existentes para preservar CarpetaControlID y CalendarEventID
  // en caso de que Bruno reconfigure el contrato después de que ya se crearon en Drive.
  const propsExistentes = obtenerPropiedades3(contratoToken);

  guardarPropiedades3(contratoToken, propiedades.map((p, i) => ({
    NumPropiedad     : i + 1,
    CarpetaControlID : (propsExistentes[i] || {}).CarpetaControlID || '',
    CalendarEventID  : (propsExistentes[i] || {}).CalendarEventID  || '',
    Tipo             : p.tipo            || 'Residencial',
    Paquete          : p.paquete         || '',
    Entregables      : p.entregables     || '',
    FechaSesion      : p.fechaSesion     || '',
    HoraSesion       : p.horaSesion      || '',
    Direccion        : '',
    LinkMaps         : '',
    Orientacion      : '',
    SobreLaPropiedad : '',
    DatosEspecificos : {},
  })));

  const primeraFecha = propiedades[0].fechaSesion || '';
  const folio        = generarFolio3(primeraFecha);

  const tipos       = propiedades.map(p => p.tipo || 'Residencial');
  const tipoPaquete = tipos.every(t => t === 'Terreno')    ? 'Terreno'
                    : tipos.every(t => t === 'Residencial') ? 'Residencial'
                    : 'Mixto';

  actualizarContrato3(contratoToken, {
    Folio         : folio,
    TipoPaquete   : tipoPaquete,
    NumPropiedades: propiedades.length,
  });

  marcarTokenUsado3(token);

  // Reinicia la expiración del token de portal: puede haber pasado tiempo desde
  // que Bruno creó el contrato hasta que terminó de configurarlo.
  refrescarExpiryTokenPortal3(contratoToken);

  const urlPortal = CONFIG3.BASE_URL_PORTAL + '?token=' + contratoToken;

  Logger.log('Configuración guardada: ' + contrato.NombreCliente + ' | folio: ' + folio);
  return jsonResponse3({ ok: true, urlPortal: urlPortal, folio: folio });
}

// ─── AUTOMATIZACIONES — DRIVE ─────────────────────────────────────────────────

function crearEstructuraDrive3(contrato, props) {
  const carpetaRaiz = DriveApp.getFolderById(CONFIG3.CARPETA_PROYECTOS_ID);
  const resultados  = [];

  props.forEach((prop, i) => {
    try {
      // Si ya existe un ID guardado, reutilizar la carpeta sin crear duplicados.
      if (prop.CarpetaControlID) {
        try {
          const carpetaControl = DriveApp.getFolderById(prop.CarpetaControlID);
          const parents = carpetaControl.getParents();
          if (!parents.hasNext()) throw new Error('carpeta sin padre');
          const carpetaCliente = parents.next();
          const folio  = contrato.Folio || generarFolio3(prop.FechaSesion);
          const numP   = prop.NumPropiedad || (i + 1);
          const sufijo = props.length > 1 ? ' P' + numP : '';
          resultados.push({
            numPropiedad      : numP,
            carpetaCliente    : carpetaCliente,
            carpetaControl    : carpetaControl,
            urlCarpetaCliente : carpetaCliente.getUrl(),
            urlCarpetaControl : carpetaControl.getUrl(),
            folio             : folio + sufijo,
          });
          return;
        } catch(e) {
          Logger.log('CarpetaControlID inválido, recreando carpeta: ' + e.message);
        }
      }

      const fechaObj  = prop.FechaSesion ? new Date(prop.FechaSesion) : new Date();
      const ano       = String(fechaObj.getFullYear());
      const mes       = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const nombreMes = obtenerNombreMes3(mes);
      const numP      = prop.NumPropiedad || (i + 1);
      const folio     = contrato.Folio || generarFolio3(prop.FechaSesion);
      const sufijo    = props.length > 1 ? ' P' + numP : '';
      const mesesCorto = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
      const fechaCorta = props.length > 1
        ? ' (' + fechaObj.getDate() + mesesCorto[fechaObj.getMonth()] + ')'
        : '';
      const nombreCarpeta = folio + sufijo + fechaCorta + ' IA ' + contrato.NombreCliente;

      const carpetaAno     = buscarOCrearCarpeta3(ano, carpetaRaiz);
      const carpetaMes     = buscarOCrearCarpeta3(nombreMes, carpetaAno);
      const carpetaCliente = buscarOCrearCarpeta3(nombreCarpeta, carpetaMes);
      const carpetaControl = buscarOCrearCarpeta3('Control Interno', carpetaCliente);
      buscarOCrearCarpeta3(folio + sufijo + ' Entregables', carpetaCliente);

      // Guardar el ID de la carpeta en Propiedades3 para evitar duplicados futuros.
      actualizarPropiedad3(contrato.Token, numP, { CarpetaControlID: carpetaControl.getId() });

      resultados.push({
        numPropiedad      : numP,
        carpetaCliente    : carpetaCliente,
        carpetaControl    : carpetaControl,
        urlCarpetaCliente : carpetaCliente.getUrl(),
        urlCarpetaControl : carpetaControl.getUrl(),
        folio             : folio + sufijo,
      });
    } catch (err) {
      Logger.log('Error creando carpeta P' + (i + 1) + ': ' + err.message);
      resultados.push({ numPropiedad: i + 1, error: err.message });
    }
  });

  return resultados;
}

// ─── AUTOMATIZACIONES — SLIDES / PDF DE REFERENCIAS ──────────────────────────

function generarPDFReferencias3(contrato, prop, carpetaControl, folioPropiedad) {
  const esTerreno = (prop.Tipo || '').toLowerCase() === 'terreno';
  const nombreDoc = folioPropiedad + ' IAV ' + contrato.NombreCliente + ' - Referencias';

  const fechaObj = prop.FechaSesion ? new Date(prop.FechaSesion) : null;
  const fechaStr = fechaObj && !isNaN(fechaObj)
    ? formatFechaEspanol3(fechaObj).split(' · ')[0] : '—';
  const horaStr  = prop.HoraSesion || (fechaObj && !isNaN(fechaObj)
    ? Utilities.formatDate(fechaObj, 'America/Monterrey', 'HH:mm') : '—');
  const de = prop.DatosEspecificos || {};

  const doc  = DocumentApp.create(nombreDoc);
  const body = doc.getBody();
  body.clear();
  body.setMarginTop(50).setMarginBottom(50).setMarginLeft(60).setMarginRight(60);

  function lv(label, value) {
    if (!value) return;
    const lp = body.appendParagraph(label);
    lp.setSpacingBefore(6).setSpacingAfter(0);
    lp.editAsText().setBold(true).setFontSize(8).setForegroundColor('#888888');
    const vp = body.appendParagraph(String(value));
    vp.setSpacingBefore(0).setSpacingAfter(0);
    vp.editAsText().setFontSize(10).setForegroundColor('#1C1C1E');
  }

  function sec(title) {
    const p = body.appendParagraph(title);
    p.setSpacingBefore(16).setSpacingAfter(4);
    p.editAsText().setBold(true).setFontSize(9).setForegroundColor('#C9A84C');
  }

  // Encabezado
  const t1 = body.appendParagraph('INMUEBLES AUDIOVISUALES');
  t1.setSpacingBefore(0).setSpacingAfter(2);
  t1.editAsText().setBold(true).setFontSize(16).setForegroundColor('#1C1C1E');

  const t2 = body.appendParagraph('Hoja de Referencias · ' + folioPropiedad);
  t2.setSpacingBefore(0).setSpacingAfter(14);
  t2.editAsText().setFontSize(11).setForegroundColor('#C9A84C');

  // Cliente
  sec('CLIENTE');
  lv('Nombre', contrato.NombreCliente);
  lv('Teléfono', contrato.TelefonoCliente);
  lv('Correo', contrato.CorreoCliente);

  // Sesión
  sec('SESIÓN');
  lv('Paquete', prop.Paquete);
  lv('Tipo de propiedad', prop.Tipo);
  lv('Fecha de sesión', fechaStr);
  lv('Hora', horaStr);
  lv('Entregables', prop.Entregables);

  // Ubicación
  sec('UBICACIÓN');
  lv('Dirección', prop.Direccion);
  lv('Enlace de Maps', prop.LinkMaps);
  lv('Orientación del video', prop.Orientacion ? prop.Orientacion.split(' — ')[0] : '');
  lv('Referencias de cómo llegar', de.referencias);

  // Descripción de la propiedad
  if (prop.SobreLaPropiedad) {
    sec(esTerreno ? 'SOBRE EL TERRENO' : 'SOBRE LA PROPIEDAD');
    const sp = body.appendParagraph(prop.SobreLaPropiedad);
    sp.setSpacingBefore(4).setSpacingAfter(0);
    sp.editAsText().setFontSize(10).setForegroundColor('#333333');
  }

  // Campos específicos de terreno (camelCase — así los guarda portal.html)
  if (esTerreno && (de.accesoTerreno || de.orientacionFrente)) {
    sec('ACCESO Y FRENTE');
    lv('Acceso al terreno', de.accesoTerreno);
    lv('Orientación del frente', de.orientacionFrente);
  }

  // Notas adicionales
  if (de.presentes || de.comentarios) {
    sec('NOTAS');
    lv('Presentes en la sesión', de.presentes);
    lv('Comentarios adicionales', de.comentarios);
  }

  doc.saveAndClose();

  try {
    const pdfBlob = DriveApp.getFileById(doc.getId())
      .getAs('application/pdf')
      .setName(nombreDoc + '.pdf');
    const pdfFile = carpetaControl.createFile(pdfBlob);
    DriveApp.getFileById(doc.getId()).setTrashed(true);
    return pdfFile.getUrl();
  } catch (err) {
    try { DriveApp.getFileById(doc.getId()).setTrashed(true); } catch(e) {}
    throw err;
  }
}

// ─── AUTOMATIZACIONES — CALENDAR ─────────────────────────────────────────────

function crearEventoCalendar3(contrato, prop, folio, urlPDF, urlCarpeta) {
  const fechaSesion = prop.FechaSesion ? new Date(prop.FechaSesion) : null;
  if (!fechaSesion || isNaN(fechaSesion)) {
    Logger.log('crearEventoCalendar3: fecha inválida para ' + folio);
    return null;
  }

  const fin    = new Date(fechaSesion.getTime() + 2 * 60 * 60 * 1000);
  const titulo = folio + ' IA ' + contrato.NombreCliente + ' — ' + prop.Paquete;

  const partes = [
    prop.Tipo + ' — ' + prop.Paquete,
    prop.Direccion       ? 'Dirección: '      + prop.Direccion           : '',
    prop.LinkMaps        ? 'Mapa: '           + prop.LinkMaps            : '',
    prop.Orientacion     ? 'Orientación: '    + prop.Orientacion         : '',
    prop.Entregables     ? 'Entregables: '    + prop.Entregables         : '',
    prop.SobreLaPropiedad? 'Notas: '          + prop.SobreLaPropiedad    : '',
    urlPDF               ? 'PDF Referencias: '+ urlPDF                   : '',
    urlCarpeta           ? 'Carpeta Drive: '  + urlCarpeta               : '',
  ].filter(Boolean);

  const evento = CalendarApp.getDefaultCalendar().createEvent(titulo, fechaSesion, fin, {
    description: partes.join('\n'),
    location   : prop.LinkMaps || prop.Direccion || '',
  });

  Logger.log('Evento Calendar creado: ' + titulo);
  return evento.getId();
}

function actualizarEventoCalendar3(calEventId, contrato, prop, folio) {
  const fechaSesion = prop.FechaSesion ? new Date(prop.FechaSesion) : null;
  if (!fechaSesion || isNaN(fechaSesion)) {
    Logger.log('actualizarEventoCalendar3: fecha inválida para ' + folio);
    return calEventId;
  }

  const fin    = new Date(fechaSesion.getTime() + 2 * 60 * 60 * 1000);
  const titulo = folio + ' IA ' + contrato.NombreCliente + ' — ' + prop.Paquete;
  const desc   = [
    prop.Tipo + ' — ' + prop.Paquete,
    prop.Direccion        ? 'Dirección: '   + prop.Direccion        : '',
    prop.LinkMaps         ? 'Mapa: '        + prop.LinkMaps         : '',
    prop.Orientacion      ? 'Orientación: ' + prop.Orientacion      : '',
    prop.Entregables      ? 'Entregables: ' + prop.Entregables      : '',
    prop.SobreLaPropiedad ? 'Notas: '       + prop.SobreLaPropiedad : '',
  ].filter(Boolean).join('\n');

  if (calEventId) {
    try {
      const evento = CalendarApp.getDefaultCalendar().getEventById(calEventId);
      if (evento) {
        evento.setTime(fechaSesion, fin);
        evento.setTitle(titulo);
        evento.setDescription(desc);
        evento.setLocation(prop.LinkMaps || prop.Direccion || '');
        Logger.log('Evento Calendar actualizado: ' + titulo);
        return calEventId;
      }
    } catch (e) {
      Logger.log('actualizarEventoCalendar3: evento no encontrado, creando nuevo. ' + e.message);
    }
  }

  const nuevoEvento = CalendarApp.getDefaultCalendar().createEvent(titulo, fechaSesion, fin, {
    description: desc,
    location   : prop.LinkMaps || prop.Direccion || '',
  });
  Logger.log('Evento Calendar recreado: ' + titulo);
  return nuevoEvento.getId();
}

// ─── ENDPOINT: enviarRecordatorio ────────────────────────────────────────────

function accionEnviarRecordatorio3(body) {
  const token = (body.token || '').trim();
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  const c = obtenerContrato3(token);
  if (!c) return jsonResponse3({ error: 'Contrato no encontrado' });
  if (!c.CorreoCliente) return jsonResponse3({ error: 'El contrato no tiene correo de cliente' });

  const urlPortal  = CONFIG3.BASE_URL_PORTAL + '?token=' + c.Token;
  const anticipo   = parseFloat(c.Anticipo)    || 0;
  const precioTotal = parseFloat(c.PrecioTotal) || 0;
  const pct        = precioTotal > 0 ? Math.round(anticipo / precioTotal * 100) : 50;

  const html = correoRecordatorioAnticipo3(c, urlPortal, anticipo, pct);
  enviarCorreo3(
    c.CorreoCliente,
    'Recordatorio: anticipo pendiente — Inmuebles Audiovisuales',
    html
  );
  return jsonResponse3({ ok: true });
}

// ─── ENDPOINT: guardarNotaPropiedad ──────────────────────────────────────────

function accionGuardarNotaPropiedad3(body) {
  const token    = (body.token    || '').trim();
  const numProp  = parseInt(body.numPropiedad) || 1;
  const nota     = (body.nota     || '').trim();
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  const ok = actualizarPropiedad3(token, numProp, { NotaInterna: nota });
  if (!ok) return jsonResponse3({ error: 'Propiedad no encontrada' });
  return jsonResponse3({ ok: true });
}

// ─── ENDPOINT: exportarCSV ────────────────────────────────────────────────────

function accionExportarCSV3(e) {
  const hoja  = getContratosSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];

  const cols = ['Folio','NombreCliente','CorreoCliente','TelefonoCliente',
                'Estatus','TipoContrato','TipoPaquete','PrecioTotal',
                'Anticipo','SaldoPendiente','FechaCreacion'];

  const filas = [cols.join(',')];
  for (let i = 1; i < datos.length; i++) {
    const fila = {};
    enc.forEach((col, j) => { fila[col] = datos[i][j]; });
    if (!fila.Token) continue;
    if (esSi3(fila.Oculto)) continue;
    filas.push(cols.map(col => {
      let v = fila[col];
      if (v instanceof Date) v = Utilities.formatDate(v, 'America/Monterrey', 'yyyy-MM-dd');
      v = String(v || '').replace(/"/g, '""');
      return '"' + v + '"';
    }).join(','));
  }
  return jsonResponse3({ ok: true, csv: filas.join('\n'), total: filas.length - 1 });
}

// ─── PLANTILLAS DE CORREO ─────────────────────────────────────────────────────

function htmlEsc3(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sanitizarParaSheets(val) {
  if (typeof val !== 'string') return val;
  return /^[=+\-@\t\r]/.test(val) ? "'" + val : val;
}

function _encabezadoCorreo3() {
  return '<img src="https://inmueblesaudiovisuales.com/email-header.png" width="100%" style="display:block">';
}

function _pieCorreo3() {
  return '<div style="padding:14px 24px;text-align:center;border-top:1px solid #E8E8EA">' +
         '<p style="margin:0;font-size:11px;color:#9B9B9F">© 2026 Inmuebles Audiovisuales · Monterrey, NL</p>' +
         '</div>';
}

function correoRecordatorioAnticipo3(contrato, urlPortal, anticipo, pct) {
  const nombre1 = (contrato.NombreCliente || '').split(' ')[0];
  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">' +
    _encabezadoCorreo3() +
    '<div style="padding:28px 24px;background:#FAFAFA">' +
      '<h2 style="margin:0 0 8px;font-size:18px;color:#1C1C1E">Hola, ' + htmlEsc3(nombre1) + '.</h2>' +
      '<p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px">' +
        'Te recordamos que tienes un anticipo pendiente para confirmar tu fecha de sesión con Inmuebles Audiovisuales. ' +
        'Trabajamos por orden de confirmación.' +
      '</p>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
        '<tr>' +
          '<td style="padding:8px 0;border-bottom:1px solid #E8E8EA;font-size:13px;color:#9B9B9F;width:140px">Cliente</td>' +
          '<td style="padding:8px 0;border-bottom:1px solid #E8E8EA;font-size:13px;font-weight:600;color:#1C1C1E">' + htmlEsc3(contrato.NombreCliente) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:8px 0;border-bottom:1px solid #E8E8EA;font-size:13px;color:#9B9B9F">Folio</td>' +
          '<td style="padding:8px 0;border-bottom:1px solid #E8E8EA;font-size:13px;font-weight:600;color:#1C1C1E">' + htmlEsc3(contrato.Folio) + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="padding:8px 0;font-size:13px;color:#9B9B9F">Anticipo (' + pct + '%)</td>' +
          '<td style="padding:8px 0;font-size:16px;font-weight:700;color:#C9A84C">' + formatMXN3(anticipo) + '</td>' +
        '</tr>' +
      '</table>' +
      '<a href="' + urlPortal + '" style="display:block;background:#C9A84C;color:#1C1C1E;text-decoration:none;text-align:center;padding:14px;font-weight:700;font-size:13px;border-radius:6px;margin-bottom:16px">VER OPCIONES DE PAGO</a>' +
      '<p style="font-size:12px;color:#9B9B9F;text-align:center;margin:0">' +
        'Cualquier duda escríbenos por <a href="' + CONFIG3.WA_LINK + '" style="color:#C9A84C;text-decoration:none">WhatsApp</a>.' +
      '</p>' +
    '</div>' +
    _pieCorreo3() +
  '</div>';
}

function correoReagendamiento3(contrato, prop, nuevaFechaStr, nuevaHora) {
  const para = contrato.CorreoCliente;
  if (!para || !String(para).trim()) return;

  const fecha = new Date(nuevaFechaStr.includes('T') ? nuevaFechaStr : nuevaFechaStr + 'T12:00:00');
  const fechaLegible = isNaN(fecha) ? nuevaFechaStr : Utilities.formatDate(fecha, 'America/Monterrey', 'dd/MM/yyyy');
  const nombre1 = (contrato.NombreCliente || '').split(' ')[0];

  const asunto = 'Tu sesión fue reagendada — Inmuebles Audiovisuales';
  const html = _encabezadoCorreo3() +
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:28px 24px;background:#FAFAFA">' +
    '<h2 style="margin:0 0 12px;font-size:18px;color:#1C1C1E">Hola, ' + htmlEsc3(nombre1) + '.</h2>' +
    '<p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 16px">Tu sesión ha sido reprogramada para:</p>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
    '<tr><td style="padding:10px 14px;background:#F5F5F7;font-size:13px;font-weight:700;width:120px">Fecha</td>' +
    '<td style="padding:10px 14px;border-bottom:1px solid #E8E8EA;font-size:13px;color:#1C1C1E">' + htmlEsc3(fechaLegible) + '</td></tr>' +
    (nuevaHora
      ? '<tr><td style="padding:10px 14px;background:#F5F5F7;font-size:13px;font-weight:700">Hora</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #E8E8EA;font-size:13px;color:#1C1C1E">' + htmlEsc3(nuevaHora) + '</td></tr>'
      : '') +
    (prop.Direccion
      ? '<tr><td style="padding:10px 14px;background:#F5F5F7;font-size:13px;font-weight:700">Dirección</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #E8E8EA;font-size:13px;color:#1C1C1E">' + htmlEsc3(prop.Direccion) + '</td></tr>'
      : '') +
    '</table>' +
    '<p style="font-size:12px;color:#9B9B9F;margin:0 0 8px">Si tienes alguna duda, escríbenos por <a href="' + CONFIG3.WA_LINK + '" style="color:#C9A84C;text-decoration:none">WhatsApp</a>.</p>' +
    _pieCorreo3() +
    '</div>';

  enviarCorreo3(para, asunto, html, []);
}

function correoContratoCliente3(contrato, props, token, tienePdf) {
  const urlPortal = CONFIG3.BASE_URL_PORTAL + '?token=' + token;
  const pctAnticipo = contrato.PrecioTotal > 0
    ? Math.round((parseFloat(contrato.Anticipo) / parseFloat(contrato.PrecioTotal)) * 100)
    : 50;
  const entregablesHtml3 = (texto) => {
    const items = (texto || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (!items.length) return '';
    return '<ul style="margin:6px 0 12px;padding-left:18px">' +
      items.map(item => {
        const partes = item.split(' — ');
        if (partes.length > 1) {
          return '<li style="font-size:12px;color:#444;line-height:1.5;margin-bottom:3px"><strong style="color:#1C1C1E">' + htmlEsc3(partes[0]) + '</strong> — ' + htmlEsc3(partes.slice(1).join(' — ')) + '</li>';
        }
        return '<li style="font-size:12px;color:#444;line-height:1.5;margin-bottom:3px">' + htmlEsc3(item) + '</li>';
      }).join('') +
    '</ul>';
  };

  const resumen   = props.map((p, i) => {
    const etiqueta = props.length > 1 ? 'Propiedad ' + (i + 1) : htmlEsc3(contrato.TipoPaquete || p.Paquete || '');
    const detalle  = (p.Direccion ? htmlEsc3(p.Direccion) + ' · ' : '') + htmlEsc3(formatFechaEspanol3(p.FechaSesion));
    return '<tr>' +
      '<td style="padding:6px 0 2px;border-bottom:none;font-size:12px;color:#9B9B9F;width:130px;vertical-align:top">' + etiqueta + '</td>' +
      '<td style="padding:6px 0 2px;border-bottom:none;font-size:12px;font-weight:600;color:#1C1C1E;vertical-align:top">' + detalle + '</td>' +
    '</tr>' +
    (p.Entregables
      ? '<tr><td></td><td style="padding-bottom:10px;border-bottom:1px solid #E8E8EA">' + entregablesHtml3(p.Entregables) + '</td></tr>'
      : '<tr><td colspan="2" style="border-bottom:1px solid #E8E8EA;padding:0 0 4px"></td></tr>');
  }).join('');

  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">' +
    _encabezadoCorreo3() +
    '<div style="padding:28px 24px;background:#FAFAFA">' +
      '<h2 style="margin:0 0 8px;font-size:18px;color:#1C1C1E">Hola, ' + htmlEsc3(contrato.NombreCliente) + '.</h2>' +
      '<p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px">' +
        'Recibimos tu información.' +
        (tienePdf ? ' Adjunto encontrarás tu contrato firmado.' : '') +
        ' Para confirmar tu fecha, realiza el anticipo a la brevedad. ' +
        'Trabajamos por orden de confirmación.' +
      '</p>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
        resumen +
        '<tr>' +
          '<td style="padding:8px 0;font-size:13px;color:#9B9B9F">Anticipo (' + pctAnticipo + '%)</td>' +
          '<td style="padding:8px 0;font-size:16px;font-weight:700;color:#C9A84C">' + formatMXN3(contrato.Anticipo) + '</td>' +
        '</tr>' +
      '</table>' +
      '<a href="' + urlPortal + '" style="display:block;background:#C9A84C;color:#1C1C1E;text-decoration:none;text-align:center;padding:14px;font-weight:700;font-size:13px;border-radius:6px;margin-bottom:12px">VER OPCIONES DE PAGO</a>' +
      '<div style="background:#F5F5F7;border-radius:8px;padding:14px 16px;margin-bottom:16px">' +
        '<p style="font-size:12px;font-weight:700;color:#1C1C1E;margin:0 0 4px">Antes de tu sesión</p>' +
        '<p style="font-size:12px;color:#9B9B9F;margin:0 0 8px;line-height:1.6">Preparamos una guía con todo lo que debes saber para aprovechar al máximo tu sesión.</p>' +
        '<a href="https://inmueblesaudiovisuales.com/guia_sesion.html" style="color:#C9A84C;font-weight:700;font-size:12px;text-decoration:none">Ver guía de preparación</a>' +
      '</div>' +
      '<p style="font-size:12px;color:#9B9B9F;text-align:center;margin:0">' +
        'Cualquier duda escríbenos por <a href="' + CONFIG3.WA_LINK + '" style="color:#C9A84C;text-decoration:none">WhatsApp</a>.' +
      '</p>' +
    '</div>' +
    _pieCorreo3() +
  '</div>';
}

function correoContratoFirmadoBruno3(contrato) {
  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">' +
    _encabezadoCorreo3() +
    '<div style="padding:24px;background:#FAFAFA">' +
      '<h2 style="margin:0 0 12px;font-size:17px;color:#1C1C1E">Contrato firmado — ' + htmlEsc3(contrato.NombreCliente) + '</h2>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
        '<tr><td style="padding:5px 0;font-size:13px;color:#9B9B9F;width:130px">Folio</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#1C1C1E">' + htmlEsc3(contrato.Folio) + '</td></tr>' +
        '<tr><td style="padding:5px 0;font-size:13px;color:#9B9B9F">Correo</td><td style="padding:5px 0;font-size:13px;color:#1C1C1E">' + htmlEsc3(contrato.CorreoCliente) + '</td></tr>' +
        '<tr><td style="padding:5px 0;font-size:13px;color:#9B9B9F">Teléfono</td><td style="padding:5px 0;font-size:13px;color:#1C1C1E">' + htmlEsc3(contrato.TelefonoCliente) + '</td></tr>' +
        '<tr><td style="padding:5px 0;font-size:13px;color:#9B9B9F">Precio total</td><td style="padding:5px 0;font-size:14px;font-weight:700;color:#C9A84C">' + formatMXN3(contrato.PrecioTotal) + '</td></tr>' +
        '<tr><td style="padding:5px 0;font-size:13px;color:#9B9B9F">Anticipo esperado</td><td style="padding:5px 0;font-size:13px;color:#1C1C1E">' + formatMXN3(contrato.Anticipo) + '</td></tr>' +
      '</table>' +
      '<p style="font-size:13px;color:#444;margin:0">Cuando recibas el pago, regístralo desde el panel de administración.</p>' +
    '</div>' +
    _pieCorreo3() +
  '</div>';
}

function correoConfirmacionAbono3(contrato, abonos, totalAbonado, token) {
  const saldo         = Math.max(0, (parseFloat(contrato.PrecioTotal) || 0) - totalAbonado);
  const urlPortal     = token ? CONFIG3.BASE_URL_PORTAL + '?token=' + token : '';
  const resumenAbonos = abonos.map(a =>
    '<tr>' +
      '<td style="padding:5px 0;border-bottom:1px solid #E8E8EA;font-size:12px;color:#9B9B9F">' + (a.Metodo || 'Transferencia') + '</td>' +
      '<td style="padding:5px 0;border-bottom:1px solid #E8E8EA;font-size:12px;color:#1C1C1E;text-align:right">' + formatMXN3(a.Monto) + '</td>' +
    '</tr>'
  ).join('');

  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">' +
    _encabezadoCorreo3() +
    '<div style="padding:28px 24px;background:#FAFAFA">' +
      '<h2 style="margin:0 0 8px;font-size:18px;color:#1C1C1E">Tu sesión está apartada, ' + htmlEsc3(contrato.NombreCliente) + '.</h2>' +
      '<p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px">Recibimos tu pago. Tu fecha queda confirmada.</p>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">' +
        resumenAbonos +
        '<tr><td style="padding:8px 0;font-size:13px;color:#9B9B9F">Total pagado</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#1C1C1E;text-align:right">' + formatMXN3(totalAbonado) + '</td></tr>' +
        '<tr><td style="padding:8px 0;font-size:13px;color:#9B9B9F">Saldo pendiente</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#C9A84C;text-align:right">' + formatMXN3(saldo) + '</td></tr>' +
      '</table>' +
      '<p style="font-size:13px;color:#444;margin:0 0 16px">El saldo restante se liquida al momento de la entrega del material. Cualquier duda, <a href="' + CONFIG3.WA_LINK + '" style="color:#C9A84C;text-decoration:none;font-weight:600">contáctanos por WhatsApp</a>.</p>' +
      (urlPortal ? '<a href="' + urlPortal + '" style="display:block;background:#C9A84C;color:#1C1C1E;text-decoration:none;text-align:center;padding:14px;font-weight:700;font-size:13px;border-radius:6px;margin-bottom:4px">VER MI COMPROBANTE</a>' : '') +
    '</div>' +
    _pieCorreo3() +
  '</div>';
}

function correoEntregaCliente3(contrato, token) {
  const urlPortal = CONFIG3.BASE_URL_PORTAL + '?token=' + token;
  return '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">' +
    _encabezadoCorreo3() +
    '<div style="padding:28px 24px;background:#FAFAFA">' +
      '<h2 style="margin:0 0 8px;font-size:18px;color:#1C1C1E">Tu material está listo, ' + htmlEsc3(contrato.NombreCliente) + '.</h2>' +
      '<p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px">' +
        'Accede al siguiente enlace para descargar todo el material de tu proyecto. Los archivos estarán disponibles por 30 días.' +
      '</p>' +
      '<a href="' + urlPortal + '" style="display:block;background:#C9A84C;color:#1C1C1E;text-decoration:none;text-align:center;padding:14px;font-weight:700;font-size:13px;border-radius:6px;margin-bottom:16px">VER Y DESCARGAR MATERIAL</a>' +
      '<p style="font-size:12px;color:#9B9B9F;text-align:center;margin:0">Folio del proyecto: <strong>' + contrato.Folio + '</strong></p>' +
    '</div>' +
    _pieCorreo3() +
  '</div>';
}

// ─── ENDPOINT: registrarAbono ─────────────────────────────────────────────────

function accionRegistrarAbono3(body) {
  const token  = body.token  || '';
  const monto  = parseFloat(body.monto) || 0;
  const metodo = body.metodo || 'Transferencia';
  const notas  = body.notas  || '';

  if (!token || !monto) return jsonResponse3({ error: 'Token y monto son obligatorios' });

  // Lock para evitar que dos requests simultáneos dupliquen el primer abono.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  let esPrimerAbono  = false;
  let saldoNuevo     = 0;
  let estatusNuevo   = '';
  let nombreCliente  = '';
  let totalAbonado   = 0;
  try {
    const contrato = obtenerContrato3(token);
    if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

    nombreCliente = contrato.NombreCliente || '';
    esPrimerAbono = !contrato.FechaUltimoAbono || String(contrato.FechaUltimoAbono).trim() === '';

    registrarAbonoFila3(token, monto, metodo, notas);

    const abonos = obtenerAbonos3(token);
    totalAbonado = abonos.reduce((s, a) => s + (parseFloat(a.Monto) || 0), 0);
    saldoNuevo         = Math.max(0, (parseFloat(contrato.PrecioTotal) || 0) - totalAbonado);
    // No retroceder un estatus ya avanzado por un abono parcial.
    const ESTATUSES_AVANZADOS = ['En produccion', 'Entregado'];
    estatusNuevo = saldoNuevo === 0
      ? 'Liquidado'
      : (ESTATUSES_AVANZADOS.includes(contrato.Estatus) ? contrato.Estatus : 'Anticipo recibido');

    actualizarContrato3(token, {
      SaldoPendiente  : saldoNuevo,
      FechaUltimoAbono: new Date().toISOString(),
      Estatus         : estatusNuevo,
    });
  } finally {
    // Liberar el lock antes de las operaciones lentas de Drive/Calendar.
    lock.releaseLock();
  }

  if (esPrimerAbono) {
    try {
      const contratoActual = obtenerContrato3(token);
      const props          = obtenerPropiedades3(token);
      const carpetas       = crearEstructuraDrive3(contratoActual, props);

      carpetas.forEach((resultado, i) => {
        if (resultado.error) {
          Logger.log('Error Drive P' + (i + 1) + ': ' + resultado.error);
          return;
        }
        const prop   = props[i];
        const folioP = resultado.folio;

        let urlPDF = '';
        try {
          urlPDF = generarPDFReferencias3(contratoActual, prop, resultado.carpetaControl, folioP);
        } catch (err) {
          Logger.log('Error PDF referencias P' + (i + 1) + ': ' + err.message);
        }

        if (!prop.CalendarEventID) {
          try {
            const calEventId = crearEventoCalendar3(contratoActual, prop, folioP, urlPDF, resultado.urlCarpetaCliente);
            if (calEventId) {
              actualizarPropiedad3(contratoActual.Token, i + 1, { CalendarEventID: calEventId });
            }
          } catch (err) {
            Logger.log('Error Calendar P' + (i + 1) + ': ' + err.message);
          }
        }
      });

    } catch (err) {
      Logger.log('Error en automatizaciones del primer abono: ' + err.message);
    }
  }

  const contratoFinal = obtenerContrato3(token);
  const abonosFinal   = obtenerAbonos3(token);

  enviarCorreo3(
    contratoFinal.CorreoCliente,
    'Confirmación de pago — Inmuebles Audiovisuales',
    correoConfirmacionAbono3(contratoFinal, abonosFinal, totalAbonado, token),
    []
  );

  Logger.log('Abono registrado: ' + nombreCliente + ' | monto: ' + monto + ' | saldo: ' + saldoNuevo);
  return jsonResponse3({
    ok            : true,
    totalAbonado  : totalAbonado,
    saldoPendiente: saldoNuevo,
    estatus       : estatusNuevo,
  });
}

// ─── ENDPOINT: actualizarEstatus ─────────────────────────────────────────────

const ESTATUSES_VALIDOS3 = [
  'Pendiente firma','Firmado','Anticipo recibido',
  'En produccion','Entregado','Liquidado',
];

function accionActualizarEstatus3(body) {
  const token   = body.token   || '';
  const estatus = body.estatus || '';

  if (!token || !estatus)             return jsonResponse3({ error: 'Token y estatus son obligatorios' });
  if (!ESTATUSES_VALIDOS3.includes(estatus)) return jsonResponse3({ error: 'Estatus no válido: ' + estatus });

  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  actualizarContrato3(token, { Estatus: estatus });
  Logger.log('Estatus actualizado: ' + contrato.NombreCliente + ' -> ' + estatus);
  return jsonResponse3({ ok: true, estatus: estatus });
}

// ─── ENDPOINT: guardarEntrega ─────────────────────────────────────────────────

function accionGuardarEntrega3(body) {
  const token      = body.token      || '';
  const driveLink  = body.driveLink  || '';
  const linksExtra = body.linksExtra || '';

  if (!token || !driveLink) return jsonResponse3({ error: 'Token y link de Drive son obligatorios' });

  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  const esPrimeraEntrega = !contrato.EntregaDriveLink || String(contrato.EntregaDriveLink).trim() === '';

  const nuevoEstatus = contrato.Estatus === 'Liquidado' ? 'Liquidado' : 'Entregado';
  actualizarContrato3(token, {
    EntregaDriveLink : driveLink,
    EntregaLinksExtra: linksExtra,
    FechaEntrega     : new Date().toISOString(),
    Estatus          : nuevoEstatus,
  });

  if (esPrimeraEntrega) {
    enviarCorreo3(
      contrato.CorreoCliente,
      'Tu material está listo — Inmuebles Audiovisuales',
      correoEntregaCliente3(contrato, token),
      []
    );
  }

  Logger.log('Entrega guardada: ' + contrato.NombreCliente + ' | link: ' + driveLink + (esPrimeraEntrega ? '' : ' (actualización, correo omitido)'));
  return jsonResponse3({ ok: true });
}

// ─── TRIGGERS ─────────────────────────────────────────────────────────────────

function instalarTriggers3() {
  // Ejecutar UNA vez desde el editor de Apps Script.
  const FUNCIONES = ['limpiarTokensViejos3'];

  ScriptApp.getProjectTriggers().forEach(t => {
    if (FUNCIONES.includes(t.getHandlerFunction())) {
      ScriptApp.deleteTrigger(t);
      Logger.log('Trigger eliminado: ' + t.getHandlerFunction());
    }
  });

  ScriptApp.newTrigger('limpiarTokensViejos3')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(1)
    .create();

  Logger.log('instalarTriggers3: trigger semanal creado para lunes 01:00');
}

// ─── ENDPOINT: subirArchivo ──────────────────────────────────────────────────

function accionSubirArchivo3(body) {
  const token = body.token || '';
  if (!token) return jsonResponse3({ ok: false, error: 'Token requerido' });

  const tokenData = obtenerToken3(token);
  if (!tokenData || !estaTokenVigente3(tokenData)) {
    return jsonResponse3({ ok: false, error: 'Token inválido o expirado' });
  }
  if (tokenData.tipo !== 'contrato') {
    return jsonResponse3({ ok: false, error: 'Token de tipo incorrecto' });
  }

  const contratoID = tokenData.contratoID;
  const contrato   = obtenerContrato3(contratoID);
  if (!contrato) return jsonResponse3({ ok: false, error: 'Contrato no encontrado' });

  const props = obtenerPropiedades3(contratoID);
  if (!props.length) return jsonResponse3({ ok: false, error: 'Sin propiedades configuradas' });

  const propIndex  = Math.min(parseInt(body.propIndex) || 0, props.length - 1);
  const tipo       = (body.tipo       || 'archivo').replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName   = (body.fileName   || tipo + '_' + Date.now()).replace(/[^\w.\-]/g, '_');
  const MIME_PERMITIDOS3 = new Set(['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','application/pdf']);
  const mimeType = MIME_PERMITIDOS3.has(body.mimeType) ? body.mimeType : 'image/jpeg';
  const rawBase64  = (body.fileBase64 || '').replace(/^data:[^;]+;base64,/, '');

  if (!rawBase64) return jsonResponse3({ ok: false, error: 'Archivo vacío' });

  const carpetas  = crearEstructuraDrive3(contrato, props);
  const resultado = carpetas[propIndex] || carpetas[0];
  if (!resultado || resultado.error) {
    return jsonResponse3({ ok: false, error: 'Error al preparar carpeta: ' + (resultado ? resultado.error : 'sin resultado') });
  }

  const fileBlob = Utilities.newBlob(Utilities.base64Decode(rawBase64), mimeType, fileName);
  const file     = resultado.carpetaControl.createFile(fileBlob);

  Logger.log('subirArchivo: ' + fileName + ' (' + tipo + ') — ' + contrato.NombreCliente);
  return jsonResponse3({ ok: true, url: file.getUrl(), nombre: file.getName() });
}

// ─── ENDPOINT: reagendarPropiedad ────────────────────────────────────────────

function accionReagendarPropiedad3(body) {
  const token        = body.token        || '';
  const numPropiedad = parseInt(body.numPropiedad) || 1;
  const nuevaFecha   = (body.fecha || '').trim();
  const nuevaHora    = (body.hora  || '').trim();

  if (!token)      return jsonResponse3({ ok: false, error: 'Token requerido' });
  if (!nuevaFecha) return jsonResponse3({ ok: false, error: 'Fecha requerida' });

  const fechaObj = new Date(nuevaFecha.includes('T') ? nuevaFecha : nuevaFecha + 'T12:00:00');
  if (isNaN(fechaObj)) return jsonResponse3({ ok: false, error: 'Fecha inválida' });

  const contrato = obtenerContrato3(token);
  if (!contrato)  return jsonResponse3({ ok: false, error: 'Contrato no encontrado' });

  const props = obtenerPropiedades3(token);
  const idx   = numPropiedad - 1;
  if (!props[idx]) return jsonResponse3({ ok: false, error: 'Propiedad no encontrada' });

  const prop = props[idx];

  // Guardar como string YYYY-MM-DD para evitar drift de timezone al serializar en Sheets.
  const cambiosFecha = { FechaSesion: nuevaFecha };
  if (nuevaHora) cambiosFecha.HoraSesion = nuevaHora;
  actualizarPropiedad3(token, numPropiedad, cambiosFecha);

  const propActualizada = Object.assign({}, prop, { FechaSesion: fechaObj, HoraSesion: nuevaHora || prop.HoraSesion });
  const folio = contrato.Folio || token.substring(0, 8);

  try {
    const nuevoCalId = actualizarEventoCalendar3(prop.CalendarEventID || '', contrato, propActualizada, folio);
    if (nuevoCalId && nuevoCalId !== prop.CalendarEventID) {
      actualizarPropiedad3(token, numPropiedad, { CalendarEventID: nuevoCalId });
    }
  } catch (e) {
    Logger.log('reagendarPropiedad: error Calendar: ' + e.message);
  }

  if (prop.CarpetaControlID && props.length > 1) {
    try {
      const carpetaControl = DriveApp.getFolderById(prop.CarpetaControlID);
      const parents = carpetaControl.getParents();
      if (parents.hasNext()) {
        const carpetaCliente = parents.next();
        const mesesCorto = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
        const sufijo     = ' P' + numPropiedad;
        const fechaCorta = ' (' + fechaObj.getDate() + mesesCorto[fechaObj.getMonth()] + ')';
        const nuevoNombre = folio + sufijo + fechaCorta + ' IA ' + contrato.NombreCliente;
        carpetaCliente.setName(nuevoNombre);
        Logger.log('Carpeta Drive renombrada: ' + nuevoNombre);
      }
    } catch (e) {
      Logger.log('reagendarPropiedad: error renombrando carpeta Drive: ' + e.message);
    }
  }

  try {
    correoReagendamiento3(contrato, propActualizada, nuevaFecha, nuevaHora);
  } catch (e) {
    Logger.log('reagendarPropiedad: error correo: ' + e.message);
  }

  return jsonResponse3({ ok: true });
}

// ─── ENDPOINT: ocultarContrato ───────────────────────────────────────────────

function accionOcultarContrato3(body) {
  const token = body.token || '';
  if (!token) return jsonResponse3({ ok: false, error: 'Token requerido' });
  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ ok: false, error: 'Contrato no encontrado' });
  actualizarContrato3(token, { Oculto: true });
  return jsonResponse3({ ok: true });
}

// ─── ENDPOINT: eliminarContrato ──────────────────────────────────────────────

function accionEliminarContrato3(body) {
  const token = body.token || '';
  if (!token) return jsonResponse3({ ok: false, error: 'Token requerido' });
  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ ok: false, error: 'Contrato no encontrado' });

  // Borrar en cascada. Siempre iterar de abajo hacia arriba para evitar
  // que deleteRow() desplace los índices y deje filas sin borrar.
  _eliminarFilasPorToken3(getContratosSheet3(), 'Token', token);
  _eliminarFilasPorToken3(getAbonosSheet3(),    'ContratoToken', token);
  _eliminarFilasPorToken3(getPropiedadesSheet3(),'ContratoToken', token);
  // Tokens3: buscar por ContratoID (col 1) para capturar tanto el token
  // de tipo 'contrato' como el de tipo 'configurar' del mismo contrato.
  _eliminarFilasTokens3(token);

  return jsonResponse3({ ok: true });
}

function _eliminarFilasPorToken3(hoja, columna, valor) {
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const col   = enc.indexOf(columna);
  if (col === -1) return;
  for (let i = datos.length - 1; i >= 1; i--) {
    if (String(datos[i][col]) === String(valor)) hoja.deleteRow(i + 1);
  }
}

function _eliminarFilasTokens3(contratoID) {
  const hoja  = getTokensSheet3();
  const datos = hoja.getDataRange().getValues();
  // Tokens3: [Token, ContratoID, Tipo, Expira, Usado] — buscar por col 1 (ContratoID)
  for (let i = datos.length - 1; i >= 1; i--) {
    if (String(datos[i][1]) === String(contratoID)) hoja.deleteRow(i + 1);
  }
}

// ─── ENDPOINT: listarStats ───────────────────────────────────────────────────

function accionListarStats3(e) {
  const periodo = (e.parameter.periodo || 'mes').toLowerCase();

  const ahora   = new Date();
  const anio    = ahora.getFullYear();
  const mes     = ahora.getMonth();

  function parseFecha(fecha) {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    const s = String(fecha);
    // Strings de fecha sin hora (ej. "2026-05-01") se parsean como UTC medianoche.
    // Añadir T12:00:00 garantiza que caigan en el día correcto en cualquier zona horaria.
    return new Date(s.includes('T') ? s : s + 'T12:00:00');
  }

  function enPeriodo(fecha) {
    if (!fecha) return false;
    const d = parseFecha(fecha);
    if (!d || isNaN(d)) return false;
    if (periodo === 'mes')       return d.getFullYear() === anio && d.getMonth() === mes;
    if (periodo === 'trimestre') {
      const trimActual = Math.floor(mes / 3);
      return d.getFullYear() === anio && Math.floor(d.getMonth() / 3) === trimActual;
    }
    if (periodo === 'anio')      return d.getFullYear() === anio;
    return true; // 'todo'
  }

  // Leer contratos
  const hojaC  = getContratosSheet3();
  const datosC = hojaC.getDataRange().getValues();
  const encC   = datosC[0];
  const contratos = [];
  for (let i = 1; i < datosC.length; i++) {
    const f = {};
    encC.forEach((col, j) => { f[col] = datosC[i][j]; });
    if (!f.Token || esSi3(f.Oculto)) continue;
    contratos.push(f);
  }

  // Leer abonos
  const hojaA  = getAbonosSheet3();
  const datosA = hojaA.getDataRange().getValues();
  const encA   = datosA[0];
  const abonos = [];
  for (let i = 1; i < datosA.length; i++) {
    const f = {};
    encA.forEach((col, j) => { f[col] = datosA[i][j]; });
    if (f.ContratoToken) abonos.push(f);
  }

  // Calcular métricas del período
  const ESTATUSES_ACTIVOS = ['Pendiente firma','Firmado','Anticipo recibido','En produccion','Entregado'];
  let facturado = 0, cobrado = 0, numContratos = 0;
  const porEstatus = {};
  const porCliente = {};

  contratos.forEach(c => {
    const fCreacion = c.FechaCreacion instanceof Date ? c.FechaCreacion : new Date(c.FechaCreacion);
    if (!enPeriodo(fCreacion)) return;
    numContratos++;
    const precio = parseFloat(c.PrecioTotal) || 0;
    facturado += precio;
    const est = c.Estatus || 'Sin estatus';
    porEstatus[est] = (porEstatus[est] || 0) + 1;
    const cliente = (c.NombreCliente || '').trim();
    if (cliente) {
      if (!porCliente[cliente]) porCliente[cliente] = 0;
      porCliente[cliente] += precio;
    }
  });

  abonos.forEach(a => {
    if (!enPeriodo(a.Fecha || a.FechaRegistro)) return;
    cobrado += parseFloat(a.Monto) || 0;
  });

  const ticketPromedio = numContratos > 0 ? Math.round(facturado / numContratos) : 0;

  // Por cobrar: saldo pendiente de todos los contratos activos visibles
  const porCobrar = contratos
    .filter(c => ESTATUSES_ACTIVOS.includes(c.Estatus))
    .reduce((s, c) => s + (parseFloat(c.SaldoPendiente) || 0), 0);

  // Top 5 clientes por valor en período
  const topClientes = Object.entries(porCliente)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, total]) => ({ nombre, total }));

  // Facturación por mes — últimos 6 meses
  const mesesLabel = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const porMes = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(anio, mes - m, 1);
    const mKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    porMes.push({ mes: mesesLabel[d.getMonth()], anio: d.getFullYear(), key: mKey, facturado: 0, cobrado: 0 });
  }
  contratos.forEach(c => {
    const d = c.FechaCreacion instanceof Date ? c.FechaCreacion : new Date(c.FechaCreacion);
    if (isNaN(d)) return;
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const slot = porMes.find(p => p.key === key);
    if (slot) slot.facturado += parseFloat(c.PrecioTotal) || 0;
  });
  abonos.forEach(a => {
    const d = parseFecha(a.Fecha || a.FechaRegistro);
    if (!d || isNaN(d)) return;
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const slot = porMes.find(p => p.key === key);
    if (slot) slot.cobrado += parseFloat(a.Monto) || 0;
  });

  return jsonResponse3({
    ok            : true,
    periodo,
    facturado,
    cobrado,
    porCobrar,
    numContratos,
    ticketPromedio,
    porEstatus,
    topClientes,
    porMes,
  });
}

// ─── CHECKLIST3 ──────────────────────────────────────────────────────────────

const TEMPLATE_CHECKLIST3 = [
  { id: 'sala',           nombre: 'Sala',                    foto: null, video: null, t360: null, comentarios: [] },
  { id: 'comedor',        nombre: 'Comedor',                 foto: null, video: null, t360: null, comentarios: [] },
  { id: 'cocina',         nombre: 'Cocina',                  foto: null, video: null, t360: null, comentarios: [] },
  { id: 'hab-principal',  nombre: 'Habitación principal',    foto: null, video: null, t360: null, comentarios: [] },
  { id: 'bano-principal', nombre: 'Baño y closet principal', foto: null, video: null, t360: null, comentarios: [] },
  { id: 'hab-2',          nombre: 'Habitación 2',            foto: null, video: null, t360: null, comentarios: [] },
  { id: 'hab-3',          nombre: 'Habitación 3',            foto: null, video: null, t360: null, comentarios: [] },
  { id: 'bano-visita',    nombre: 'Baño de visita',          foto: null, video: null, t360: null, comentarios: [] },
  { id: 'cochera',        nombre: 'Cochera',                 foto: null, video: null, t360: null, comentarios: [] },
  { id: 'exterior',       nombre: 'Jardín / Exterior',       foto: null, video: null, t360: null, comentarios: [] },
  { id: 'lavado',         nombre: 'Área de lavado',          foto: null, video: null, t360: null, comentarios: [] },
];

function obtenerChecklistFila3(token) {
  const hoja  = getChecklistSheet3();
  const datos = hoja.getDataRange().getValues();
  const enc   = datos[0];
  const col   = enc.indexOf('ContratoToken');
  if (col === -1) throw new Error('Columna ContratoToken no encontrada en Checklist3');
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][col] === token) return { fila: i + 1, datos: datos[i], enc };
  }
  return null;
}

function accionObtenerChecklist3(e) {
  const token = (e.parameter.token || '').trim();
  if (!token) return jsonResponse3({ error: 'Token requerido' });

  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  const fila = obtenerChecklistFila3(token);
  let cuartos, columnas;

  if (!fila) {
    cuartos  = JSON.parse(JSON.stringify(TEMPLATE_CHECKLIST3));
    columnas = { foto: true, video: true, t360: true };
  } else {
    try {
      const guardado = JSON.parse(fila.datos[fila.enc.indexOf('CuartosJSON')] || '{}');
      // Soporta formato antiguo (array directo) y nuevo ({cuartos, columnas})
      if (Array.isArray(guardado)) {
        cuartos  = guardado;
        columnas = { foto: true, video: true, t360: true };
      } else {
        cuartos  = guardado.cuartos  || JSON.parse(JSON.stringify(TEMPLATE_CHECKLIST3));
        columnas = guardado.columnas || { foto: true, video: true, t360: true };
      }
    } catch (_) {
      cuartos  = JSON.parse(JSON.stringify(TEMPLATE_CHECKLIST3));
      columnas = { foto: true, video: true, t360: true };
    }
  }

  return jsonResponse3({
    ok: true,
    cuartos,
    columnas,
    folio:         contrato.Folio         || '',
    nombreCliente: contrato.NombreCliente || '',
  });
}

function accionGuardarChecklist3(body) {
  const token   = (body.token   || '').trim();
  const cuartos = body.cuartos;
  if (!token)   return jsonResponse3({ error: 'Token requerido' });
  if (!cuartos) return jsonResponse3({ error: 'Cuartos requeridos' });

  const contrato = obtenerContrato3(token);
  if (!contrato) return jsonResponse3({ error: 'Contrato no encontrado' });

  const columnas = body.columnas || { foto: true, video: true, t360: true };
  const hoja  = getChecklistSheet3();
  const ahora = new Date().toISOString();
  const json  = JSON.stringify({ cuartos, columnas });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const fila = obtenerChecklistFila3(token);
    if (!fila) {
      // Construir fila respetando el orden real del encabezado
      const enc      = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
      const nuevaFila = enc.map(col => {
        if (col === 'ContratoToken')      return token;
        if (col === 'CuartosJSON')        return json;
        if (col === 'FechaCreacion')      return ahora;
        if (col === 'FechaActualizacion') return ahora;
        return '';
      });
      hoja.appendRow(nuevaFila);
    } else {
      const colJSON  = fila.enc.indexOf('CuartosJSON');
      const colFecha = fila.enc.indexOf('FechaActualizacion');
      if (colJSON  === -1) throw new Error('Columna CuartosJSON no encontrada en Checklist3');
      if (colFecha === -1) throw new Error('Columna FechaActualizacion no encontrada en Checklist3');
      hoja.getRange(fila.fila, colJSON  + 1).setValue(json);
      hoja.getRange(fila.fila, colFecha + 1).setValue(ahora);
    }
  } finally {
    lock.releaseLock();
  }

  return jsonResponse3({ ok: true });
}

// ─── FUNCIONES DE PRUEBA ── ejecutar desde el editor para verificar cada sección

function probarUtilidades3() {
  Logger.log('Folio de hoy: '     + generarFolio3(new Date()));
  Logger.log('Fecha formateada: ' + formatFechaEspanol3('2026-06-15T10:00:00'));
  Logger.log('Formato MXN: '      + formatMXN3(4000));
  Logger.log('Mes: '              + obtenerNombreMes3('6'));
}

function probarHojas3() {
  try {
    Logger.log('Contratos3  — columnas: ' + getContratosSheet3().getLastColumn());
    Logger.log('Tokens3     — columnas: ' + getTokensSheet3().getLastColumn());
    Logger.log('Abonos3     — columnas: ' + getAbonosSheet3().getLastColumn());
    Logger.log('Propiedades3— columnas: ' + getPropiedadesSheet3().getLastColumn());
    Logger.log('Paquetes3   — datos:    ' + (getPaquetesSheet3().getLastRow() - 1) + ' filas');
  } catch (err) {
    Logger.log('ERROR probarHojas3: ' + err.message);
  }
}

function probarPaquetes3() {
  const todos = obtenerPaquetesActivos3(null);
  Logger.log('Total activos: ' + todos.length);
  Logger.log('Bases: '       + todos.filter(p => !p.EsAdicional).map(p => p.Clave).join(', '));
  Logger.log('Adicionales: ' + todos.filter(p =>  p.EsAdicional).map(p => p.Clave).join(', '));
}

// ─── MIGRACIÓN DE PAQUETES ── ejecutar UNA SOLA VEZ desde el editor
// Borra todos los paquetes existentes en Paquetes3 e inserta los nuevos.

function resetearPaquetes3() {
  const hoja = getPaquetesSheet3();

  // Borrar todas las filas de datos (dejar solo el encabezado en fila 1)
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila > 1) hoja.deleteRows(2, ultimaFila - 1);

  // Definición de paquetes como objetos — se insertan respetando el encabezado real de la hoja
  const paquetes = [
    // ── Residencial ──
    { Clave: 'RES-ESENCIAL', Tipo: 'Residencial', Nombre: 'Esencial', Precio: 5000, EsAdicional: 'No',
      Entregables: 'Fotografía profesional — 35 a 50 imágenes en alta resolución de interiores y exteriores. Edición de color profesional incluida.\nVideo cinemático — Clip de 30 a 60 segundos con movimientos de cámara fluidos, colorización profesional y montaje dinámico. Música libre de derechos incluida.\nGrabación aérea con drone — Tomas de fachada, patios y entorno integradas al video cinemático.\nFotografía aérea con drone — 5 imágenes en alta resolución de fachada, accesos y entorno inmediato.\nGrabación de amenidades — Alberca, gimnasio, jardines y espacios compartidos del condominio. Sujeta a autorización de la administración.',
      Activo: 'Sí', Orden: 1 },
    { Clave: 'RES-PLUS', Tipo: 'Residencial', Nombre: 'Plus', Precio: 6000, EsAdicional: 'No',
      Entregables: 'Fotografía profesional — 35 a 50 imágenes en alta resolución de interiores y exteriores. Edición de color profesional incluida.\nVideo cinemático — Clip de 30 a 60 segundos con movimientos fluidos, colorización profesional y montaje dinámico. Música libre de derechos incluida.\nGrabación aérea con drone — Tomas de fachada, patios y entorno integradas al video cinemático.\nFotografía aérea con drone — 5 imágenes en alta resolución de fachada, accesos y entorno.\nGrabación de amenidades — Sujeta a autorización de la administración.\nRecorrido virtual inmersivo — Escaneo navegable 24/7 desde cualquier dispositivo. Hospedaje en la nube incluido por 12 meses.\nNarración profesional con IA — Locución generada con IA integrada al video cinemático.\nContenido para redes sociales — 3 videos verticales (9:16) para Instagram Reels, Stories y WhatsApp.',
      Activo: 'Sí', Orden: 2 },
    { Clave: 'RES-PREMIUM', Tipo: 'Residencial', Nombre: 'Premium', Precio: 7500, EsAdicional: 'No',
      Entregables: 'Fotografía profesional — 35 a 50 imágenes en alta resolución de interiores y exteriores. Edición de color incluida.\nVideo cinemático — Clip de 30 a 60 segundos con movimientos fluidos, colorización profesional y montaje dinámico. Música libre de derechos.\nGrabación aérea con drone — Tomas de fachada, patios y entorno integradas al video cinemático.\nFotografía aérea con drone — 5 imágenes en alta resolución de fachada, accesos y entorno.\nGrabación de amenidades — Sujeta a autorización de la administración.\nRecorrido virtual inmersivo — Navegable 24/7 desde cualquier dispositivo. Hospedaje incluido por 12 meses.\nNarración profesional con IA — Locución generada con IA integrada al video cinemático.\nContenido para redes sociales — 3 videos verticales (9:16) para Instagram Reels, Stories y WhatsApp.\nVideo cómo llegar — Animación satelital de 20 a 30 segundos desde puntos de referencia clave hasta la propiedad.\nFolleto digital PDF — Con fotografías profesionales, datos de la propiedad y contacto del asesor. Listo para WhatsApp y correo.\nLanding page propia — Página web exclusiva con galería, video cinemático, recorrido virtual y formulario de contacto.',
      Activo: 'Sí', Orden: 3 },
    // ── Terreno ──
    { Clave: 'TER-ESENCIAL', Tipo: 'Terreno', Nombre: 'Esencial', Precio: 3500, EsAdicional: 'No',
      Entregables: 'Video cinemático aéreo con drone — Clip de 30 a 60 segundos filmado con drone. Colorización profesional y música libre de derechos.\nAnimación gráfica de perímetro — Límites y medidas del terreno anclados sobre el video con tracking 3D.\nFotografía aérea con delimitado — Imágenes aéreas en alta resolución con el perímetro del terreno marcado.\nGrabación de amenidades del fraccionamiento — Accesos, jardines y áreas verdes. Sujeta a autorización de la administración.',
      Activo: 'Sí', Orden: 4 },
    { Clave: 'TER-PLUS', Tipo: 'Terreno', Nombre: 'Plus', Precio: 4500, EsAdicional: 'No',
      Entregables: 'Video cinemático aéreo con drone — Clip de 30 a 60 segundos. Colorización profesional y música libre de derechos.\nAnimación gráfica de perímetro — Límites y medidas del terreno anclados sobre el video con tracking 3D.\nFotografía aérea con delimitado — Imágenes aéreas en alta resolución con el perímetro marcado.\nGrabación de amenidades del fraccionamiento — Sujeta a autorización de la administración.\nVisualización de potencial con IA — Render que muestra cómo podría lucir el terreno con una construcción. Integrado al video cinemático.\nRecorrido virtual aéreo — Vista panorámica interactiva del terreno y su entorno. Navegable 24/7. Hospedaje incluido por 12 meses.\nNarración profesional con IA — Locución integrada al video cinemático.',
      Activo: 'Sí', Orden: 5 },
    { Clave: 'TER-PREMIUM', Tipo: 'Terreno', Nombre: 'Premium', Precio: 6000, EsAdicional: 'No',
      Entregables: 'Video cinemático aéreo con drone — Clip de 30 a 60 segundos. Colorización profesional y música libre de derechos.\nAnimación gráfica de perímetro — Límites y medidas del terreno anclados sobre el video con tracking 3D.\nFotografía aérea con delimitado — Imágenes aéreas en alta resolución con el perímetro marcado.\nGrabación de amenidades del fraccionamiento — Sujeta a autorización de la administración.\nVisualización de potencial con IA — Integrada al video cinemático.\nRecorrido virtual aéreo — Navegable 24/7. Hospedaje incluido por 12 meses.\nNarración profesional con IA — Integrada al video cinemático.\nVideo cómo llegar — Animación satelital de 20 a 30 segundos desde puntos de referencia clave hasta el terreno.\nFolleto digital PDF — Con fotografías aéreas, delimitado del perímetro, visualización de potencial y contacto del asesor.\nLanding page propia — Con galería aérea, visualización de potencial con IA, recorrido virtual y formulario de contacto.',
      Activo: 'Sí', Orden: 6 },
    // ── Servicios individuales ──
    { Clave: 'IND-FOTO', Tipo: 'Residencial', Nombre: 'Fotografía Profesional', Precio: 3000, EsAdicional: 'No',
      Entregables: 'Fotografía profesional — 35 a 50 imágenes en alta resolución de interiores y exteriores a nivel de piso.\nEdición de color profesional incluida.\nFormato digital listo para portales inmobiliarios.',
      Activo: 'Sí', Orden: 7 },
    { Clave: 'IND-VIDEO', Tipo: 'Residencial', Nombre: 'Video Cinemático con Drone', Precio: 3000, EsAdicional: 'No',
      Entregables: 'Video cinemático — Clip de 30 a 60 segundos con movimientos de cámara fluidos, colorización profesional y montaje dinámico.\nTomas aéreas de fachada, patios y entorno integradas al video cinemático.\nFotografías aéreas en alta resolución incluidas.\nMúsica libre de derechos incluida.',
      Activo: 'Sí', Orden: 8 },
    { Clave: 'IND-360', Tipo: 'Residencial', Nombre: 'Recorrido Virtual Inmersivo', Precio: 3000, EsAdicional: 'No',
      Entregables: 'Recorrido virtual inmersivo — Escaneo navegable 24/7 desde cualquier dispositivo (celular, tablet o computadora).\nHospedaje en la nube incluido por 12 meses a partir de la fecha de entrega.',
      Activo: 'Sí', Orden: 9 },
    // ── Add-ons ──
    { Clave: 'ADD-ASESOR', Tipo: 'Ambos', Nombre: 'Asesor en Video', Precio: 500, EsAdicional: 'Sí',
      Entregables: 'Asesor en video — El asesor inmobiliario aparece en cámara integrado al video cinemático, grabado en locación durante la misma sesión de producción.',
      Activo: 'Sí', Orden: 10 },
    { Clave: 'ADD-EXPRESS', Tipo: 'Ambos', Nombre: 'Entrega Express', Precio: 1000, EsAdicional: 'Sí',
      Entregables: 'Entrega express — Material final editado y listo para publicar en 24 horas después de la sesión de producción.',
      Activo: 'Sí', Orden: 11 },
  ];

  // Leer el encabezado real de la hoja e insertar en el orden que corresponda
  const enc    = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];
  const filas  = paquetes.map(p => enc.map(col => (p[col] !== undefined ? p[col] : '')));
  hoja.getRange(2, 1, filas.length, enc.length).setValues(filas);
  Logger.log('Paquetes3 actualizado: ' + paquetes.length + ' paquetes insertados.');
}
