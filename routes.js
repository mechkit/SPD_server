var express = require('express');
var router = express.Router();

var mk_drawing = require('./lib/mk_drawing.js');
var mk_settings = require('./lib/mk_settings.js');
var process_system = require('./lib/process_system.js');
var mk_PDFs = require('./lib/mk_PDFs.js');
var get_DB_data = require('./lib/get_DB_data.js');

var html_wrap_svg = require('./lib/html_wrap_svg.js');


///////////////////////////////////////////
router.get('/d/SVG', function(req, res) {
  var system_id = req.query.pv_system_id;
  //var system_id = req.params.system_id;
  var SVG_url = req.headers.host+'/d/SVG?pv_system_id='+system_id;
  var PDF_url = req.headers.host+'/d/PDF?pv_system_id='+system_id;

  var responce_string = req.method + ': ' + req.url;
  console.log(responce_string);

  // update system calculations
  var system_settings = mk_settings(system_id);
  system_settings.server.host = req.headers.host;
  system_settings = process_system(system_settings);

  var status = system_settings.state.notes.errors.length ? 'error' : 'pass';

  if( status === 'pass'){
    // update drawing
    system_settings = mk_drawing(system_settings);


    var svgs = system_settings.drawing.svgs.map(function(svg){
      return svg.outerHTML;
    });

    res.json({
      system_id: system_id,
      status: status,
      notes: system_settings.state.notes,
      SVG_url: SVG_url,
      PDF_url: PDF_url,
      SVGs: svgs
    });

  } else if( status === 'error' ){

    res.json({
      system_id: system_id,
      status: status,
      notes: system_settings.state.notes,
      SVG_url: SVG_url,
      PDF_url: PDF_url,
      SVGs: []
    });

  }

});



////////////////////////////////////////////
router.get('/t/SVG_page', function(req, res) {
  var system_id = req.query.pv_system_id;
  //var system_id = req.params.system_id;
  var SVG_url = req.headers.host+'/d/SVG?pv_system_id='+system_id;
  var PDF_url = req.headers.host+'/d/PDF?pv_system_id='+system_id;

  var responce_string = req.method + ': ' + req.url;
  console.log(responce_string);

  // update system calculations
  var system_settings = mk_settings(system_id);
  system_settings.server.host = req.headers.host;
  system_settings = process_system(system_settings);

  var status = system_settings.state.notes.errors.length ? 'error' : 'pass';

  if( status === 'pass'){
    // update drawing
    system_settings = mk_drawing(system_settings);

    var svgs = system_settings.drawing.svgs.map(function(svg){
      return svg.outerHTML;
    });

    var svg_string = svgs[1];

    if( svg_string ){
      var html = html_wrap_svg(svg_string);

      res.end(html);

    } else {
      res.end();

    }


  } else if( status === 'error' ){

    res.json({
      system_id: system_id,
      status: status,
      notes: system_settings.state.notes,
      SVG_url: SVG_url,
      PDF_url: PDF_url,
      SVGs: []
    });
  }


});


/*******************************************************************
* Serves the permit to the user as a PDF for the passed system_id
*******************************************************************/
var pdfDirectory = process.env.PWD + '/private/.#pdf/';

router.get('/d/PDF', function(req, res) {
  var system_id = req.query.pv_system_id;
  //var system_id = req.params.system_id;
  var SVG_url = req.headers.host+'/d/SVG?pv_system_id='+system_id;
  var PDF_url = req.headers.host+'/d/PDF?pv_system_id='+system_id;

  var responce_string = req.method + ': ' + req.url;
  console.log(responce_string);

  // update system calculations
  var system_settings = mk_settings(system_id);
  system_settings.server.host = req.headers.host;
  system_settings = process_system(system_settings);

  // update drawing
  system_settings = mk_drawing(system_settings);

  var status = system_settings.state.notes.errors.length ? 'error' : 'pass';

  if( status === 'pass'){
    mk_PDFs(system_settings, function(PDF_file_name){
      res.json({
        system_id: system_id,
        status: status,
        notes: system_settings.state.notes,
        SVG_url: SVG_url,
        PDF_url: PDF_url,
        SVGs: [],
        PDF_file_name: PDF_file_name
      });
    });
  } else if( status === 'error' ){
    res.json({
      system_id: system_id,
      status: status,
      notes: system_settings.state.notes,
      SVG_url: SVG_url,
      PDF_url: PDF_url,
      SVGs: [],
      PDF_file_name: false
    });
  }

});


router.get('/t/PDF_download', function(req, res) {
  var system_id = req.query.pv_system_id;
  //var system_id = req.params.system_id;
  var SVG_url = req.headers.host+'/d/SVG?pv_system_id='+system_id;
  var PDF_url = req.headers.host+'/d/PDF?pv_system_id='+system_id;

  var responce_string = req.method + ': ' + req.url;
  console.log(responce_string);

  // update system calculations
  var system_settings = mk_settings(system_id);
  system_settings.server.host = req.headers.host;
  system_settings = process_system(system_settings);

  // update drawing
  system_settings = mk_drawing(system_settings);

  var status = system_settings.state.notes.errors.length ? 'error' : 'pass';

  if( status === 'pass'){

    mk_PDFs(system_settings, function(PDF_file_name){
      var filePath = pdfDirectory + PDF_file_name;
      var stat = fs.statSync(filePath);

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': stat.size,
        'Content-Disposition': 'inline; filename="FSEC_drawing.pdf"'
      });

      fs.createReadStream(filePath).pipe(res);
    });

  }

  /*
  res.json({
    system_id: system_id,
    status: status,
    notes: system_settings.state.notes,
    SVG_url: SVG_url,
    PDF_url: PDF_url,
    SVGs: {
      //1: [SVG string?],
      //2: [SVG string?],
      //3: [SVG string?]
    }
  });
  */

});


router.get('/d/PDF_test', function(req, res) {
  var system_id = req.query.pv_system_id;
  //var system_id = req.params.system_id;
  var SVG_url = req.headers.host+'/d/SVG?pv_system_id='+system_id;
  var PDF_url = req.headers.host+'/d/PDF?pv_system_id='+system_id;

  var responce_string = req.method + ': ' + req.url;
  console.log(responce_string);

  // update system calculations
  var system_settings = mk_settings(system_id);
  system_settings.server.host = req.headers.host;
  system_settings = process_system(system_settings);

  // update drawing
  system_settings = mk_drawing(system_settings);

  var status = system_settings.state.notes.errors.length ? 'error' : 'pass';

  if( status === 'pass'){

    var htmls = system_settings.drawing.svgs.map(function(svg){
      var svg_string = svg.outerHTML;
      svg_string = svg_string.replace(/<svg /g, '<svg style="position:absolute; top:0px; left:0px;" ');

      var html = '<!doctype html><html><head></head><body style="width:1554px; height:1198px; overflow:hidden;"><div> ';
      //html += svg_string;
      html += '<div>test</div>';
      html += ' </div></body></html>';

      return html;
    });

    var pdfDirectory = process.env.PWD + '/private/.#pdf/';

    htmls.forEach(function(html, i){
      console.log('page: ', i);
      //var planNumber = (new Date()).valueOf();
      var page_num = i + 1;
      var PDF_file_name = 'permit_'+system_id+'_p'+page_num+'.pdf';
      var write_path = pdfDirectory + PDF_file_name;
      //render_PDF(html, write_path);
    });

  }

  res.end(htmls[0]);

});


//'SELECT sysdate FROM dual',
//'select count(*) from devices ',
//'SELECT * FROM pvsystem_details WHERE device_id = 37',

router.get('/t/db/date', function(req, res) {
  get_DB_data('SELECT sysdate FROM dual', 'date', res);
});

router.get('/t/db/pvsystem_details', function(req, res) {
  get_DB_data('SELECT * FROM pvsystem_details WHERE device_id = 37', 'system', res);
});

router.get('/t/db/pvsystem_modules_view', function(req, res) {
  get_DB_data('SELECT * FROM pvsystem_modules_view WHERE pvsystem_id = 37', 'array', res);
});

router.get('/t/db/pvsystem_inverters_view', function(req, res) {
  get_DB_data('SELECT * FROM pvsystem_inverters_view WHERE pvsystem_id = 37', 'inverter', res);
});


router.get('/t/db', function(req, res) {
  //var system_id = req.query.pv_system_id;
  var system_id = 37;


  var queries = [
    'SELECT * FROM pvsystem_details WHERE device_id = ' + system_id, 'system',
    'SELECT * FROM pvsystem_modules_view WHERE pvsystem_id = ' + system_id, 'array',
    'SELECT * FROM pvsystem_inverters_view WHERE pvsystem_id = ' + system_id, 'inverter'
  ];

  var run_function_when_all_queries_are_ready = f.mk_ready(queries, function(){



  });


});



module.exports = router;
