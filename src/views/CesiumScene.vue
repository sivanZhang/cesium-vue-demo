<template>
  <div id="cesiumContainer">
    <div id="cntorler">
      <button @click="startHeight">高度测量</button>
      <!-- <button @click="startTriangle">三角测量</button>  -->
      <button @click="startEarthwork">开始测方</button>
      <!-- <input type="number" v-model="height" /> -->
      <!-- <button @click="test111()">测试</button> -->
      <div id="mycharts"></div>
      <!-- <button @click="cancel">退出测量</button> -->
    </div>
  </div>
</template>
<script>
const Cesium = require('cesium/Cesium')
import DigFill from './digFill'
import RangingTool from './measuringHeight'
export default {
  name: 'CesiumScene',
  data() {
    return {
      rangingTool: null,
      DigFill: null,
      height: 300
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    test111() {
      this.DigFill.test()
    },
    init() {
      Cesium.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkODZjOGY4Yy1jOGEzLTRlNzMtYTdlMS03ZWQ5MmE4M2RkMzEiLCJpZCI6MjA0NTYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1Nzc0NzI0Nzd9.3OfoKjLexR3j8kcepsM_h0hj1vEpS0jd_aw9n-izLKk'

      const terrainProvider = new Cesium.createWorldTerrain({
        requestVertexNormals: true,
        url: Cesium.IonResource.fromAssetId(3957)
      })
      const viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider,
        baseLayerPicker: false,
        fullscreenButton: false,
        scene3DOnly: true,
        animation: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        geocoder: false
      })
      const { camera, scene } = viewer
      const { globe, imageryLayers } = scene
      globe.depthTestAgainstTerrain = true
      imageryLayers.addImageryProvider(
        new Cesium.IonImageryProvider({ assetId: 3 })
      )
      const tileset = new Cesium.Cesium3DTileset({
        url: './Tileset/tileset.json'
      })
      tileset.readyPromise
        .then(function() {
          camera.viewBoundingSphere(
            tileset.boundingSphere,
            new Cesium.HeadingPitchRange(0, -0.5, 0)
          )
          camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
          const heightOffset = 70.0
          const boundingSphere = tileset.boundingSphere
          const cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center
          )
          const surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0
          )
          const offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            heightOffset
          )
          const translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3()
          )
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
          scene.primitives.add(tileset)
        })
        .otherwise(function(error) {
          throw error
        })
      this.rangingTool = new RangingTool(Cesium, viewer)
      this.DigFill = new DigFill(Cesium, viewer, {
        targerHeight: this.height,
        terrainProvider,
        echartsID: 'mycharts'
      })

      var length = 1000

      var startLon = Cesium.Math.toRadians(86.953793)
      var endLon = Cesium.Math.toRadians(86.896497)

      var lat = Cesium.Math.toRadians(27.988257)

      var terrainSamplePositions = []
      for (var i = 0; i < length; ++i) {
        var lon = Cesium.Math.lerp(endLon, startLon, i / (length - 1))
        var position = new Cesium.Cartographic(lon, lat)
        terrainSamplePositions.push(position)
      }

      Cesium.when(
        Cesium.sampleTerrainMostDetailed(
          viewer.terrainProvider,
          terrainSamplePositions
        ),
        function(samples) {
          var offset = 10.0
          for (var i = 0; i < samples.length; ++i) {
            samples[i].height += offset
          }

          viewer.entities.add({
            polyline: {
              positions: Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(
                samples
              ),
              followSurface: false,
              width: 5,
              material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.ORANGE,
                outlineWidth: 2,
                outlineColor: Cesium.Color.BLACK
              }),
              depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.RED,
                outlineWidth: 2,
                outlineColor: Cesium.Color.BLACK
              })
            }
          })

          var target = new Cesium.Cartesian3(
            300770.50872389384,
            5634912.131394585,
            2978152.2865545116
          )
          offset = new Cesium.Cartesian3(
            6344.974098678562,
            -793.3419798081741,
            2499.9508860763162
          )
          viewer.camera.lookAt(target, offset)
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
        }
      )
    },
    // cancel(){
    // 	this.rangingTool.clearAll()
    // },
    startHeight() {
      this.rangingTool.startMeasureHeight()
    },
    // startTriangle(){
    // 	this.rangingTool.startTriangulation()
    // },
    startEarthwork() {
      this.DigFill.start()
    }
  }
}
</script>

<style lang="scss" scoped>
@import url('~cesium/Widgets/widgets.css');
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
  #mycharts {
    display: none;
  }
}
</style>
