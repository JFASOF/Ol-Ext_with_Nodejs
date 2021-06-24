import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import ol_control_Bar from 'ol-ext/control/Bar';
import ol_control_Button from 'ol-ext/control/Button';
import ol_control_Toggle from 'ol-ext/control/Toggle';
import ol_control_TextButton from 'ol-ext/control/TextButton';
import Select from 'ol/interaction/Select';
import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import {LineString,Point,Polygon} from 'ol/geom';

var vectorLayer = new VectorLayer({
  source: new VectorSource()
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    vectorLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 0
  })
});

//Ana Kontrol Barı
var mb = new ol_control_Bar();
map.addControl(mb);
var eb = new ol_control_Bar({
  toggleOne: true,	// aynı anda bir kontrol aktif
  group: false			//grup kontrolleri birlikte
});
mb.addControl(eb);
// Seçim aracı ekle:
// 1- bir seçim etkileşimi ile bir geçiş kontrolü
// 2- seçilen özellik hakkında bilgi almak / silmek için bir seçenek çubuğu
var selectfromBar = new ol_control_Bar();
selectfromBar.addControl(new ol_control_Button({
  html: '<i class="fa fa-times"></i>',
  title: "Sil",
  handleClick: function () {
    var features = selectIslem.getInteraction().getFeatures();
    if (!features.getLength()) infoJson("Select an object first...");
    else infoJson(features.getLength() + " object(s) deleted.");
    for (var i = 0, f; f = features.item(i); i++) {
      vectorLayer.getSource().removeFeature(f);
    }
    selectIslem.getInteraction().getFeatures().clear();
  }
}));
selectfromBar.addControl(new ol_control_Button({
  html: '<i class="fa fa-info"></i>',
  title: "Bilgilendirme",
  handleClick: function () {
    var features = selectIslem.getInteraction().getFeatures();
    if (!features.getLength()) infoJson("Select an object first...");
    else infoJson(features.getLength() + " object(s) deleted.");
    for (var i = 0, f; f = features.item(i); i++) {
      vectorLayer.getSource().removeFeature(f);
    }
    selectIslem.getInteraction().getFeatures().clear();
  }
}));

var selectIslem = new ol_control_Toggle({
  html: '<i class="fa fa-hand-pointer-o"></i>',
  title: "Seç",
  interaction: new Select({ hitTolerance: 2 }),
  bar: selectfromBar,
  autoActivate: true,
  active: true
});
eb.addControl(selectIslem);

// Düzenleme araçları ekle
var pointEdit = new ol_control_Toggle({
  html: '<i class="fa fa-map-marker" ></i>',
  title: 'Nokta İşaretle',
  interaction: new Draw({
    type: 'Point',
    source: vectorLayer.getSource()
  })
});
eb.addControl(pointEdit);

var lineFeatureEdit = new ol_control_Toggle({
  html: '<i class="fa fa-share-alt" ></i>',
  title: 'Çizgi Çiz',
  interaction: new Draw({
    type: 'LineString',
    source: vectorLayer.getSource(),
    // Eklenen noktaları say
    geometryFunction: function (coordinates, geometry) {
      if (geometry) geometry.setCoordinates(coordinates);
      else geometry = new LineString(coordinates);
      this.nbpts = geometry.getCoordinates().length;
      return geometry;
    }
  }),
  // Kontrolle ilişkili seçenekler çubuğu
  bar: new ol_control_Bar({
    controls: [
      new ol_control_TextButton({
        html: 'Geri Al',
        title: "Son noktayı sil",
        handleClick: function () {
          if (lineFeatureEdit.getInteraction().nbpts > 1) lineFeatureEdit.getInteraction().removeLastPoint();
        }
      }),
      new ol_control_TextButton({
        html: 'Bitir',
        title: "Bitir",
        handleClick: function () {
          // FinishDrawing'de boş nesneleri engelle
          if (lineFeatureEdit.getInteraction().nbpts > 2) lineFeatureEdit.getInteraction().finishDrawing();
        }
      })
    ]
  })
});
eb.addControl(lineFeatureEdit);

 var polygonFeatureEdit = new ol_control_Toggle({
  html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
  title: 'Çokgen Çiz',
  interaction: Draw({
    type: 'Polygon',
    source: vectorLayer.getSource().dispose(),
    // Eklenen noktaları say
    geometryFunction: function (coordinates, geometry) {
      this.nbpts = coordinates[0].length;
      if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
      else geometry = new Polygon(coordinates);
      return geometry;
    }
  }),
  // Kontrolle ilişkili seçenekler çubuğu
  bar: new ol_control_Bar({
    controls: [new ol_control_TextButton({
      html: 'Geri Al',//'<i class="fa fa-mail-reply"></i>',
      title: "Son noktayı geri al",
      handleClick: function () {
        if (polygonFeatureEdit.getInteraction().nbpts > 1) polygonFeatureEdit.getInteraction().removeLastPoint();
      }
    }),
    new ol_control_TextButton({
      html: 'Bitir',
      title: "Bitir",
      handleClick: function () {
        // FinishDrawing'de boş nesneleri engelle
        if (polygonFeatureEdit.getInteraction().nbpts > 3) polygonFeatureEdit.getInteraction().finishDrawing();
      }
    })
    ]
  })
});
eb.addControl(polygonFeatureEdit); 

 var saveAllCommit=new ol_control_Button({
  html: '<i class="fa fa-download"></i>',
  title: "Kaydet",
  handleClick: function(e) {
    var json= new GeoJSON().writeFeatures(vectorLayer.getSource().getFeatures());
    infoJson(json);
  }
});
eb.addControl(saveAllCommit);
var json= new GeoJSON().writeFeatures(vectorLayer.getSource().getFeatures());
$(document).on("click","#indir",function() {
  console.log(json);
  document.getElementById("info").innerHTML=json;
});
function infoJson(i){
  $("#infoJson").html(i||"");
}

