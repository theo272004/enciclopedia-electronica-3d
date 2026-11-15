import bpy
import math
import os
from mathutils import Vector

RAW_DIR = os.path.abspath("public/modelos/raw")
MODELOS_DIR = os.path.abspath("public/modelos")


def limpiar_escena():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def crear_material_pbr(nombre, color_rgba, metalness=0.0, roughness=0.4, transmission=0.0, emissive=(0.0, 0.0, 0.0), emissive_strength=0.0):
    mat = bpy.data.materials.new(name=nombre)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color_rgba
        bsdf.inputs["Metallic"].default_value = metalness
        bsdf.inputs["Roughness"].default_value = roughness
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (*emissive, 1.0)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emissive_strength
    return mat


def importar_y_normalizar_kicad(archivo_glb, centro_xy_mm, nombre_salida=None):
    """
    Importa un .glb crudo exportado de KiCad (en metros desde public/modelos/raw),
    separa por materiales, centra en X/Y según centro_xy_mm, escala a milímetros
    (1 unidad = 1 mm) y aplica materiales PBR limpios con origen en (0,0,0).
    """
    limpiar_escena()
    ruta = os.path.join(RAW_DIR, archivo_glb)
    bpy.ops.import_scene.gltf(filepath=ruta)

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"No se encontraron mallas en {ruta}")

    bpy.ops.object.select_all(action="DESELECT")
    for m in meshes:
        m.parent = None
        m.location = (0.0, 0.0, 0.0)
        m.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()

    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    cx, cy = centro_xy_mm
    for v in obj.data.vertices:
        v.co.x = v.co.x * 1000.0 - cx
        v.co.y = v.co.y * 1000.0 - cy
        v.co.z = v.co.z * 1000.0
    obj.data.update()

    # Separar por material para poder controlar partes en Three.js
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.separate(type="MATERIAL")
    bpy.ops.object.mode_set(mode="OBJECT")

    partes = [o for o in bpy.data.objects if o.type == "MESH"]
    for o in list(bpy.data.objects):
        if o.type != "MESH":
            bpy.data.objects.remove(o, do_unlink=True)

    for idx, p in enumerate(partes):
        p.parent = None
        bpy.ops.object.select_all(action="DESELECT")
        p.select_set(True)
        bpy.context.view_layer.objects.active = p
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        mat_orig = p.data.materials[0] if p.data.materials else None
        col = mat_orig.diffuse_color[:3] if mat_orig else (0.5, 0.5, 0.5)
        if col[0] > 0.5 and col[1] > 0.5 and col[2] > 0.5:
            p.name = f"Pines_{idx}"
            p.data.name = p.name
            p.data.materials[0] = crear_material_pbr("Estano_PBR", (0.82, 0.85, 0.89, 1.0), metalness=1.0, roughness=0.22)
        elif col[0] > 0.35 and col[1] < 0.15:
            p.name = f"Lente_LED_{idx}"
            p.data.name = p.name
            p.data.materials[0] = crear_material_pbr("LED_Rojo_PBR", (1.0, 0.12, 0.12, 1.0), metalness=0.0, roughness=0.1, transmission=0.65)
        elif col[0] > 0.6 and col[1] > 0.35 and col[2] < 0.35:
            p.name = f"Cuerpo_Resistencia_{idx}"
            p.data.name = p.name
            p.data.materials[0] = crear_material_pbr("Ceramica_Resistencia_PBR", (0.85, 0.74, 0.56, 1.0), metalness=0.0, roughness=0.38)
        else:
            p.name = f"Encapsulado_{idx}"
            p.data.name = p.name
            p.data.materials[0] = crear_material_pbr("Epoxi_Negro_PBR", (0.07, 0.08, 0.10, 1.0), metalness=0.05, roughness=0.38)

    if nombre_salida:
        out_path = os.path.join(MODELOS_DIR, nombre_salida)
        bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
        print(f"✔ Modelo normalizado exportado: {out_path}")
    return partes


def agregar_bandas_resistencia():
    """Agrega las 4 bandas de color reales (1 kΩ: marrón, negro, rojo, dorado) sobre la resistencia de KiCad."""
    importar_y_normalizar_kicad("resistencia_axial.glb", (5.08, 0.0))
    bandas = [
        ("Banda_1_Marron", -1.8, (0.38, 0.18, 0.07, 1.0), 0.0),
        ("Banda_2_Negro", -0.7, (0.04, 0.04, 0.04, 1.0), 0.0),
        ("Banda_3_Rojo", 0.4, (0.78, 0.10, 0.08, 1.0), 0.0),
        ("Banda_4_Oro", 1.7, (0.88, 0.70, 0.22, 1.0), 0.85),
    ]
    for nombre, x_pos, color, metal in bandas:
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=1.28, depth=0.42, location=(x_pos, 0.0, 1.25), rotation=(0.0, math.pi / 2.0, 0.0))
        b = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        b.name = nombre
        b.data.name = nombre
        b.data.materials.append(crear_material_pbr(f"Mat_{nombre}", color, metalness=metal, roughness=0.3))

    out_path = os.path.join(MODELOS_DIR, "resistencia_axial.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Resistencia KiCad con bandas 1kΩ exportada: {out_path}")


def cortar_malla_bisect(obj, plane_co, plane_no, clear_outer=False, clear_inner=False):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.bisect(
        plane_co=plane_co,
        plane_no=plane_no,
        use_fill=True,
        clear_inner=clear_inner,
        clear_outer=clear_outer,
    )
    bpy.ops.object.mode_set(mode="OBJECT")


def crear_hilo_oro(nombre, p_inicio, p_control, p_fin, radio=0.045, mat=None):
    curve_data = bpy.data.curves.new(nombre, type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 24
    curve_data.bevel_depth = radio
    curve_data.bevel_resolution = 8

    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(2)
    pts = [p_inicio, p_control, p_fin]
    for i, co in enumerate(pts):
        bp = spline.bezier_points[i]
        bp.co = co
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"

    obj = bpy.data.objects.new(nombre, curve_data)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj.data.name = nombre
    if mat:
        obj.data.materials.append(mat)
    return obj


def construir_to92_autopsia():
    """
    Toma el modelo real TO-92 de KiCad, aplica un corte de sección transversal limpio (bisect)
    para abrir el frente del encapsulado epóxico y modela en su interior:
    - Leadframe interno de cobre estañado (pala de Colector y postes de Base y Emisor)
    - Pastilla de silicio planar epitaxial N-P-N (Colector N, Base P, Emisor N+)
    - Hilos de oro (bond wires) de 25 µm conectando el chip a los pines
    """
    partes = importar_y_normalizar_kicad("to92.glb", (1.27, 0.0))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    pines = next(p for p in partes if p.name.startswith("Pines"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"
    pines.name = "Pines_Metal"
    pines.data.name = "Pines_Metal"

    # Duplicar carcasa para crear la tapa frontal que se separa en la animación
    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    # Crear volumen de cavidad interna para tallar la cámara dentro del TO-92 (solver FLOAT)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.35, 4.95))
    cavidad = bpy.context.active_object
    cavidad.scale = (3.4, 2.3, 3.7)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    mod_diff = carcasa.modifiers.new(name="Cavidad_Autopsia", type="BOOLEAN")
    mod_diff.operation = "DIFFERENCE"
    mod_diff.solver = "FLOAT"
    mod_diff.object = cavidad
    bpy.context.view_layer.objects.active = carcasa
    bpy.ops.object.modifier_apply(modifier=mod_diff.name)

    mod_int = carcasa_tapa.modifiers.new(name="Tapa_Autopsia", type="BOOLEAN")
    mod_int.operation = "INTERSECT"
    mod_int.solver = "FLOAT"
    mod_int.object = cavidad
    bpy.context.view_layer.objects.active = carcasa_tapa
    bpy.ops.object.modifier_apply(modifier=mod_int.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    # Materiales internos de alta visibilidad
    mat_cobre = crear_material_pbr("Cobre_Leadframe", (0.85, 0.52, 0.30, 1.0), metalness=1.0, roughness=0.25)
    mat_oro = crear_material_pbr("Oro_BondWire", (1.0, 0.80, 0.28, 1.0), metalness=1.0, roughness=0.18)
    mat_silicio_n = crear_material_pbr("Silicio_N_Colector", (0.12, 0.62, 0.95, 1.0), metalness=0.25, roughness=0.2, emissive=(0.05, 0.35, 0.65), emissive_strength=0.45)
    mat_silicio_p = crear_material_pbr("Silicio_P_Base", (1.0, 0.62, 0.12, 1.0), metalness=0.2, roughness=0.2, emissive=(0.75, 0.38, 0.04), emissive_strength=0.65)
    mat_silicio_nplus = crear_material_pbr("Silicio_NPlus_Emisor", (0.22, 0.92, 1.0, 1.0), metalness=0.3, roughness=0.18, emissive=(0.12, 0.75, 0.95), emissive_strength=0.75)

    def crear_bloque(nombre, loc, dim, mat):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        b = bpy.context.active_object
        b.scale = dim
        bpy.ops.object.transform_apply(scale=True)
        b.name = nombre
        b.data.name = nombre
        b.data.materials.append(mat)
        return b

    # 1. Leadframe interno (postes desde z=2.5 hasta z=4.2 dentro del epoxi)
    crear_bloque("Leadframe_Poste_C", (-1.27, 0.0, 3.35), (0.38, 0.22, 1.7), mat_cobre)
    crear_bloque("Leadframe_Paleta_C", (-0.15, 0.05, 4.2), (1.45, 0.95, 0.18), mat_cobre)
    crear_bloque("Leadframe_Poste_B", (0.0, -0.38, 3.35), (0.34, 0.22, 1.7), mat_cobre)
    crear_bloque("Leadframe_Poste_E", (1.27, 0.0, 3.35), (0.38, 0.22, 1.7), mat_cobre)

    # 2. Pastilla de Silicio N-P-N (3 capas apiladas sobre la paleta del Colector)
    crear_bloque("Die_Colector_N", (-0.05, 0.05, 4.44), (1.12, 0.78, 0.28), mat_silicio_n)
    crear_bloque("Die_Base_P", (-0.05, 0.05, 4.66), (0.94, 0.64, 0.14), mat_silicio_p)
    crear_bloque("Die_Emisor_NPlus", (0.08, 0.05, 4.82), (0.58, 0.44, 0.16), mat_silicio_nplus)

    # 3. Hilos de enlace de oro (Bond Wires de 25 µm)
    crear_hilo_oro(
        "Hilo_Oro_Base",
        Vector((-0.34, -0.10, 4.73)),
        Vector((-0.16, -0.32, 5.42)),
        Vector((0.0, -0.38, 4.18)),
        radio=0.04,
        mat=mat_oro,
    )
    crear_hilo_oro(
        "Hilo_Oro_Emisor",
        Vector((0.15, 0.05, 4.90)),
        Vector((0.75, 0.0, 5.62)),
        Vector((1.27, 0.0, 4.18)),
        radio=0.04,
        mat=mat_oro,
    )

    out_path = os.path.join(MODELOS_DIR, "to92_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo TO-92 con autopsia interna N-P-N exportado: {out_path}")


if __name__ == "__main__":
    importar_y_normalizar_kicad("to92.glb", (1.27, 0.0), "to92.glb")
    importar_y_normalizar_kicad("to220.glb", (2.54, 0.0), "to220.glb")
    importar_y_normalizar_kicad("sot23.glb", (0.0, 0.0), "sot23.glb")
    importar_y_normalizar_kicad("led5mm.glb", (1.27, 0.0), "led5mm.glb")
    importar_y_normalizar_kicad("pulsador_6mm.glb", (3.25, -2.25), "pulsador_6mm.glb")
    agregar_bandas_resistencia()
    construir_to92_autopsia()
