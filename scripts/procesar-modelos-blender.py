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


def crear_bloque(nombre, loc, dim, mat):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    b = bpy.context.active_object
    b.scale = dim
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    b.name = nombre
    b.data.name = nombre
    b.data.materials.append(mat)
    return b


def construir_to92_autopsia():
    partes = importar_y_normalizar_kicad("to92.glb", (1.27, 0.0))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    pines = next(p for p in partes if p.name.startswith("Pines"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"
    pines.name = "Pines_Metal"
    pines.data.name = "Pines_Metal"

    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.35, 4.95))
    cavidad = bpy.context.active_object
    cavidad.scale = (3.4, 2.3, 3.7)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj_target, op in [(carcasa, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]:
        mod = obj_target.modifiers.new(name="Bool", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    mat_cobre = crear_material_pbr("Cobre_Leadframe", (0.85, 0.52, 0.30, 1.0), metalness=1.0, roughness=0.25)
    mat_oro = crear_material_pbr("Oro_BondWire", (1.0, 0.80, 0.28, 1.0), metalness=1.0, roughness=0.18)
    mat_silicio_n = crear_material_pbr("Silicio_N_Colector", (0.12, 0.62, 0.95, 1.0), metalness=0.25, roughness=0.2, emissive=(0.05, 0.35, 0.65), emissive_strength=0.45)
    mat_silicio_p = crear_material_pbr("Silicio_P_Base", (1.0, 0.62, 0.12, 1.0), metalness=0.2, roughness=0.2, emissive=(0.75, 0.38, 0.04), emissive_strength=0.65)
    mat_silicio_nplus = crear_material_pbr("Silicio_NPlus_Emisor", (0.22, 0.92, 1.0, 1.0), metalness=0.3, roughness=0.18, emissive=(0.12, 0.75, 0.95), emissive_strength=0.75)

    crear_bloque("Leadframe_Poste_C", (-1.27, 0.0, 3.35), (0.38, 0.22, 1.7), mat_cobre)
    crear_bloque("Leadframe_Paleta_C", (-0.15, 0.05, 4.2), (1.45, 0.95, 0.18), mat_cobre)
    crear_bloque("Leadframe_Poste_B", (0.0, -0.38, 3.35), (0.34, 0.22, 1.7), mat_cobre)
    crear_bloque("Leadframe_Poste_E", (1.27, 0.0, 3.35), (0.38, 0.22, 1.7), mat_cobre)

    crear_bloque("Die_Colector_N", (-0.05, 0.05, 4.44), (1.12, 0.78, 0.28), mat_silicio_n)
    crear_bloque("Die_Base_P", (-0.05, 0.05, 4.66), (0.94, 0.64, 0.14), mat_silicio_p)
    crear_bloque("Die_Emisor_NPlus", (0.08, 0.05, 4.82), (0.58, 0.44, 0.16), mat_silicio_nplus)

    crear_hilo_oro("Hilo_Oro_Base", Vector((-0.34, -0.10, 4.73)), Vector((-0.16, -0.32, 5.42)), Vector((0.0, -0.38, 4.18)), radio=0.04, mat=mat_oro)
    crear_hilo_oro("Hilo_Oro_Emisor", Vector((0.15, 0.05, 4.90)), Vector((0.75, 0.0, 5.62)), Vector((1.27, 0.0, 4.18)), radio=0.04, mat=mat_oro)

    out_path = os.path.join(MODELOS_DIR, "to92_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo TO-92 con autopsia interna N-P-N exportado: {out_path}")


def construir_rele_autopsia():
    """
    Reconstruye el Relé Electromecánico fiel a la foto real (relé transparente con base negra):
    - Base_Negra inferior donde se anclan los 5 pines THT.
    - Carcasa_Base y Carcasa_Corte de policarbonato transparente tipo cristal.
    - Lado derecho (x = +2.4 mm): Carrete negro con bridas + 22 espiras visibles de cobre esmaltado
      + núcleo de hierro dulce + yugo metálico en L.
    - Lado izquierdo (x = -5.4, -3.5, -1.6 mm): Las 3 láminas verticales paralelas de latón/cobre
      (NC izquierda, COM móvil central empujada por la armadura superior, y NO derecha) con
      sus remaches cilíndricos redondos de plata AgSnO2 enfrentados en la parte alta.
    """
    partes = importar_y_normalizar_kicad("rele_spdt.glb", (0.0, -8.7))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    pines = next(p for p in partes if p.name.startswith("Pines"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"
    pines.name = "Pines_Metal"
    pines.data.name = "Pines_Metal"

    mat_cristal = crear_material_pbr("Policarbonato_Cristal", (0.82, 0.92, 1.0, 0.35), metalness=0.0, roughness=0.08, transmission=0.82)
    mat_base_negra = crear_material_pbr("Base_Termoplastico_Negro", (0.05, 0.06, 0.08, 1.0), metalness=0.05, roughness=0.45)
    mat_bobina = crear_material_pbr("Cobre_Esmaltado", (0.88, 0.44, 0.16, 1.0), metalness=0.95, roughness=0.18, emissive=(0.65, 0.25, 0.04), emissive_strength=0.25)
    mat_hierro = crear_material_pbr("Hierro_Dulce_Nucleo", (0.52, 0.56, 0.62, 1.0), metalness=0.95, roughness=0.28)
    mat_laton = crear_material_pbr("Laton_Lamina_Contacto", (0.94, 0.72, 0.32, 1.0), metalness=0.95, roughness=0.18)
    mat_plata = crear_material_pbr("Plata_AgSnO2_Remache", (0.96, 0.98, 1.0, 1.0), metalness=1.0, roughness=0.10)

    carcasa.data.materials[0] = mat_cristal
    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    # Tallar cámara interna amplia dejando paredes finas de 0.9 mm como la caja acrílica real
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.2, 10.6))
    cavidad = bpy.context.active_object
    cavidad.scale = (14.8, 19.2, 15.2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj_target, op in [(carcasa, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]:
        mod = obj_target.modifiers.new(name="Bool_Rele", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    # 1. Zócalo / Base negra inferior + Carrete (Bobbin flanges)
    b1 = crear_bloque("Zocalo_Base", (0.0, 0.0, 1.6), (16.2, 21.8, 3.0), mat_base_negra)
    bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=4.3, depth=0.7, location=(2.6, 0.0, 3.6))
    f_inf = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=4.3, depth=0.7, location=(2.6, 0.0, 13.8))
    f_sup = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in [b1, f_inf, f_sup]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = b1
    bpy.ops.object.join()
    b1.name = "Base_Carrete_Negro"
    b1.data.name = "Base_Carrete_Negro"
    b1.data.materials.clear()
    b1.data.materials.append(mat_base_negra)

    # 2. Núcleo ferromagnético central + polo superior
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=1.8, depth=12.2, location=(2.6, 0.0, 8.9))
    nucleo = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    nucleo.name = "Nucleo_Hierro"
    nucleo.data.name = "Nucleo_Hierro"
    nucleo.data.materials.append(mat_hierro)

    # 3. Devanado de Cobre con 20 espiras toroidales reales apiladas (aspecto 100% real de alambre enrollado)
    espiras = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=3.65, depth=9.4, location=(2.6, 0.0, 8.7))
    cuerpo_bob = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    espiras.append(cuerpo_bob)
    for k in range(18):
        z_k = 4.2 + k * 0.52
        bpy.ops.mesh.primitive_torus_add(major_radius=3.75, minor_radius=0.28, major_segments=36, minor_segments=12, location=(2.6, 0.0, z_k))
        esp = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        espiras.append(esp)
    bpy.ops.object.select_all(action="DESELECT")
    for e in espiras:
        e.select_set(True)
    bpy.context.view_layer.objects.active = espiras[0]
    bpy.ops.object.join()
    bobina = bpy.context.active_object
    bobina.name = "Bobina_Cobre"
    bobina.data.name = "Bobina_Cobre"
    bobina.data.materials.clear()
    bobina.data.materials.append(mat_bobina)

    # 4. Yugo magnético en L en el costado derecho de la bobina
    y1 = crear_bloque("Yugo_V", (6.5, 0.0, 9.2), (0.85, 5.8, 12.2), mat_hierro)
    y2 = crear_bloque("Yugo_H", (4.2, 0.0, 3.3), (5.2, 5.8, 0.85), mat_hierro)
    bpy.ops.object.select_all(action="DESELECT")
    y1.select_set(True)
    y2.select_set(True)
    bpy.context.view_layer.objects.active = y1
    bpy.ops.object.join()
    y1.name = "Yugo_Hierro"
    y1.data.name = "Yugo_Hierro"

    # 5. Las 3 Láminas Verticales Paralelas de Contacto en el lado izquierdo (exactamente como la foto)
    # 5a. Lámina izquierda fija: Contacto NC (x = -5.6 mm) + Remache de plata mirando hacia +X
    l_nc = crear_bloque("Lamina_NC", (-5.6, 0.0, 9.2), (0.38, 3.6, 11.5), mat_laton)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.95, depth=0.75, location=(-5.2, 0.0, 12.8), rotation=(0.0, math.pi / 2.0, 0.0))
    r_nc = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.select_all(action="DESELECT")
    l_nc.select_set(True)
    r_nc.select_set(True)
    bpy.context.view_layer.objects.active = l_nc
    bpy.ops.object.join()
    l_nc.name = "Contacto_NC"
    l_nc.data.name = "Contacto_NC"
    l_nc.data.materials.clear()
    l_nc.data.materials.append(mat_plata)

    # 5b. Lámina derecha fija: Contacto NO (x = -1.6 mm) + Remache de plata mirando hacia -X
    l_no = crear_bloque("Lamina_NO", (-1.6, 0.0, 9.2), (0.38, 3.6, 11.5), mat_laton)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.95, depth=0.75, location=(-2.0, 0.0, 12.8), rotation=(0.0, math.pi / 2.0, 0.0))
    r_no = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.select_all(action="DESELECT")
    l_no.select_set(True)
    r_no.select_set(True)
    bpy.context.view_layer.objects.active = l_no
    bpy.ops.object.join()
    l_no.name = "Contacto_NO"
    l_no.data.name = "Contacto_NO"
    l_no.data.materials.clear()
    l_no.data.materials.append(mat_plata)

    # 5c. Armadura Superior en L + Lámina Móvil Central COM (x = -3.6 mm) con remache doble
    arm_h = crear_bloque("Arm_Sup", (1.6, 0.0, 15.6), (9.6, 5.4, 0.85), mat_laton)
    lam_com = crear_bloque("Lam_Com", (-3.6, 0.0, 9.4), (0.35, 3.6, 12.0), mat_laton)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1.0, depth=1.1, location=(-3.6, 0.0, 12.8), rotation=(0.0, math.pi / 2.0, 0.0))
    r_com = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in [arm_h, lam_com, r_com]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm_h
    bpy.ops.object.join()
    arm_h.name = "Armadura_Movil"
    arm_h.data.name = "Armadura_Movil"
    arm_h.data.materials.clear()
    arm_h.data.materials.append(mat_laton)

    out_path = os.path.join(MODELOS_DIR, "rele_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo Relé Transparente con 3 láminas verticales y bobina en carrete exportado: {out_path}")


def construir_mosfet_autopsia():
    partes = importar_y_normalizar_kicad("to220.glb", (2.54, 0.0))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    pines = next(p for p in partes if p.name.startswith("Pines"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"
    pines.name = "Pines_Metal"
    pines.data.name = "Pines_Metal"

    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.2, -0.4, 8.3))
    cavidad = bpy.context.active_object
    cavidad.scale = (8.4, 3.2, 7.4)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj_target, op in [(carcasa, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]:
        mod = obj_target.modifiers.new(name="Bool_Mosfet", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    mat_drenador = crear_material_pbr("Silicio_Drenador_N", (0.10, 0.55, 0.95, 1.0), metalness=0.3, roughness=0.2, emissive=(0.05, 0.35, 0.75), emissive_strength=0.45)
    mat_canal_p = crear_material_pbr("Silicio_Canal_P", (1.0, 0.58, 0.12, 1.0), metalness=0.2, roughness=0.2, emissive=(0.80, 0.38, 0.05), emissive_strength=0.65)
    mat_oxido = crear_material_pbr("Oxido_SiO2_Gate", (0.68, 0.32, 1.0, 1.0), metalness=0.1, roughness=0.12, emissive=(0.55, 0.20, 0.95), emissive_strength=0.85)
    mat_fuente = crear_material_pbr("Celdas_Fuente_NPlus", (0.18, 0.95, 0.78, 1.0), metalness=0.35, roughness=0.18, emissive=(0.10, 0.85, 0.65), emissive_strength=0.75)
    mat_aluminio = crear_material_pbr("Aluminio_BondWire", (0.92, 0.95, 0.98, 1.0), metalness=1.0, roughness=0.16)

    crear_bloque("Sustrato_Drenador_N", (0.0, 1.15, 8.2), (5.2, 0.45, 4.8), mat_drenador)
    crear_bloque("Cuerpo_P_Canal", (0.0, 0.78, 8.2), (4.6, 0.30, 4.2), mat_canal_p)
    crear_bloque("Oxido_SiO2_Compuerta", (-0.8, 0.52, 8.2), (2.8, 0.22, 3.6), mat_oxido)
    crear_bloque("Celdas_Fuente_NPlus", (0.7, 0.32, 8.2), (2.6, 0.24, 3.4), mat_fuente)

    crear_hilo_oro("Hilo_Gate", Vector((-1.5, 0.40, 7.4)), Vector((-2.1, -0.35, 6.2)), Vector((-2.54, 0.0, 4.2)), radio=0.09, mat=mat_aluminio)
    crear_hilo_oro("Cinta_Source_49A", Vector((1.1, 0.20, 8.2)), Vector((2.0, -0.45, 6.4)), Vector((2.54, 0.0, 4.2)), radio=0.18, mat=mat_aluminio)

    out_path = os.path.join(MODELOS_DIR, "mosfet_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo MOSFET TO-220 IRFZ44N con autopsia interna HEXFET exportado: {out_path}")


def construir_cap_autopsia():
    """
    Episodio 04: Toma el capacitor electrolítico radial 8mm de KiCad 9.0, corta una ventana
    en el cilindro de aluminio y modela el rollo interno de láminas de aluminio anodizado
    + óxido Al2O3 + papel impregnado en electrolito y el tapón de goma inferior.
    """
    partes = importar_y_normalizar_kicad("cap_electrolitico.glb", (1.75, 0.0))
    pines = next(p for p in partes if p.name.startswith("Pines"))
    pines.name = "Pines_Metal"
    pines.data.name = "Pines_Metal"

    encapsulados = [p for p in partes if p.name.startswith("Encapsulado")]
    carcasa = encapsulados[0]
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"

    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2.2, -2.2, 6.2))
    cavidad = bpy.context.active_object
    cavidad.scale = (5.2, 5.2, 9.2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    objetos_bool = [(e_obj, "DIFFERENCE") for e_obj in encapsulados] + [(pines, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]
    for obj_target, op in objetos_bool:
        mod = obj_target.modifiers.new(name="Bool_Cap", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    mat_anodo = crear_material_pbr("Lamina_Anodo_Al", (0.85, 0.90, 0.96, 1.0), metalness=0.95, roughness=0.2)
    mat_oxido = crear_material_pbr("Dielectrico_Al2O3", (0.20, 0.85, 1.0, 1.0), metalness=0.2, roughness=0.18, emissive=(0.10, 0.65, 0.95), emissive_strength=0.6)
    mat_papel = crear_material_pbr("Papel_Electrolito", (0.88, 0.68, 0.36, 1.0), metalness=0.0, roughness=0.5, emissive=(0.55, 0.35, 0.08), emissive_strength=0.35)

    # Capas cilíndricas concéntricas del rollo interno con corte escalonado (wedge cutaway)
    for idx_c, (nombre, rad, alt, mat) in enumerate([
        ("Rollo_Anodo_Al", 3.15, 7.6, mat_anodo),
        ("Capa_Dielectrico_Al2O3", 2.60, 7.8, mat_oxido),
        ("Rollo_Papel_Electrolito", 2.00, 8.0, mat_papel),
        ("Nucleo_Catodo_Al", 1.30, 8.2, mat_anodo),
    ]):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=rad, depth=alt, location=(0.0, 0.0, 5.4))
        c = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        if idx_c < 3:
            # Cortar cuadrante escalonado para dejar ver cada capa concéntrica interna
            offset_c = 0.35 * idx_c
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2.2 + offset_c, -2.2 - offset_c, 5.4))
            corte_c = bpy.context.active_object
            corte_c.scale = (5.0, 5.0, 9.5)
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            mod_c = c.modifiers.new(name="Bool_Layer", type="BOOLEAN")
            mod_c.operation = "DIFFERENCE"
            mod_c.solver = "FLOAT"
            mod_c.object = corte_c
            bpy.context.view_layer.objects.active = c
            bpy.ops.object.modifier_apply(modifier=mod_c.name)
            bpy.data.objects.remove(corte_c, do_unlink=True)
        c.name = nombre
        c.data.name = nombre
        c.data.materials.append(mat)

    out_path = os.path.join(MODELOS_DIR, "cap_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo Capacitor Electrolítico con autopsia interna exportado: {out_path}")


def construir_diodo_autopsia():
    """
    Episodio 05: Toma el diodo DO-41 1N4007 de KiCad 9.0, abre la mitad frontal del cilindro
    epóxico y modela los dos cabezales térmicos de cobre (slugs), la unión de silicio P-N
    y la banda de agotamiento central.
    """
    partes = importar_y_normalizar_kicad("diodo_1n4007.glb", (5.08, 0.0))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"

    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.9, 1.85))
    cavidad = bpy.context.active_object
    cavidad.scale = (4.4, 2.0, 2.6)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj_target, op in [(carcasa, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]:
        mod = obj_target.modifiers.new(name="Bool_Diodo", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    mat_cobre = crear_material_pbr("Cobre_Slug", (0.88, 0.50, 0.25, 1.0), metalness=0.95, roughness=0.22)
    mat_p = crear_material_pbr("Silicio_P_Anodo", (1.0, 0.55, 0.15, 1.0), metalness=0.2, roughness=0.2, emissive=(0.85, 0.35, 0.05), emissive_strength=0.65)
    mat_n = crear_material_pbr("Silicio_N_Catodo", (0.15, 0.85, 1.0, 1.0), metalness=0.2, roughness=0.2, emissive=(0.08, 0.65, 0.95), emissive_strength=0.65)
    mat_barrera = crear_material_pbr("Barrera_Agotamiento", (0.95, 0.25, 0.45, 1.0), metalness=0.1, roughness=0.15, emissive=(0.95, 0.15, 0.35), emissive_strength=0.9)

    for nombre, x_pos, largo, radio, mat in [
        ("Slug_Cobre_Catodo", -1.25, 1.3, 0.85, mat_cobre),
        ("Silicio_N_Catodo", -0.35, 0.48, 0.82, mat_n),
        ("Barrera_Agotamiento", 0.0, 0.22, 0.84, mat_barrera),
        ("Silicio_P_Anodo", 0.35, 0.48, 0.82, mat_p),
        ("Slug_Cobre_Anodo", 1.25, 1.3, 0.85, mat_cobre),
    ]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radio, depth=largo, location=(x_pos, 0.0, 1.85), rotation=(0.0, math.pi / 2.0, 0.0))
        s = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        s.name = nombre
        s.data.name = nombre
        s.data.materials.append(mat)

    out_path = os.path.join(MODELOS_DIR, "diodo_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo Diodo DO-41 1N4007 con autopsia P-N exportado: {out_path}")


def construir_inductor_autopsia():
    """
    Episodio 06: Toma el inductor de potencia blindado Bourns SRR1260 de KiCad 9.0,
    abre su escudo magnético de ferrita mediante corte booleano y modela el tambor
    central de ferrita, el devanado de cobre grueso y los anillos toroidales de campo magnético.
    """
    partes = importar_y_normalizar_kicad("inductor_smd.glb", (0.0, 0.0))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"

    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2.2, -2.2, 3.2))
    cavidad = bpy.context.active_object
    cavidad.scale = (9.5, 9.5, 5.8)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj_target, op in [(carcasa, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]:
        mod = obj_target.modifiers.new(name="Bool_Ind", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    mat_ferrita = crear_material_pbr("Nucleo_Ferrita_MnZn", (0.22, 0.24, 0.28, 1.0), metalness=0.4, roughness=0.45)
    mat_cobre = crear_material_pbr("Cobre_Devanado", (0.90, 0.48, 0.18, 1.0), metalness=0.95, roughness=0.2, emissive=(0.65, 0.28, 0.05), emissive_strength=0.35)
    mat_campo = crear_material_pbr("Flujo_Magnetico", (0.20, 0.90, 1.0, 1.0), metalness=0.1, roughness=0.15, emissive=(0.12, 0.82, 1.0), emissive_strength=0.9)

    bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=2.4, depth=4.6, location=(0.0, 0.0, 3.1))
    nuc = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    nuc.name = "Nucleo_Ferrita"
    nuc.data.name = "Nucleo_Ferrita"
    nuc.data.materials.append(mat_ferrita)

    espiras = []
    for k in range(8):
        z_k = 1.4 + k * 0.48
        bpy.ops.mesh.primitive_torus_add(major_radius=3.5, minor_radius=0.32, major_segments=36, minor_segments=12, location=(0.0, 0.0, z_k))
        e = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        espiras.append(e)
    bpy.ops.object.select_all(action="DESELECT")
    for e in espiras:
        e.select_set(True)
    bpy.context.view_layer.objects.active = espiras[0]
    bpy.ops.object.join()
    bob = bpy.context.active_object
    bob.name = "Bobina_Cobre"
    bob.data.name = "Bobina_Cobre"
    bob.data.materials.clear()
    bob.data.materials.append(mat_cobre)

    # Anillos de Flujo Magnético 3D
    anillos = []
    for ang_deg in [0, 60, 120, 180, 240, 300]:
        rad_a = math.radians(ang_deg)
        x_a = math.cos(rad_a) * 3.5
        y_a = math.sin(rad_a) * 3.5
        bpy.ops.mesh.primitive_torus_add(
            major_radius=1.8,
            minor_radius=0.11,
            major_segments=32,
            minor_segments=10,
            location=(x_a, y_a, 3.1),
            rotation=(math.pi / 2.0, 0.0, rad_a + math.pi / 2.0),
        )
        a = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        anillos.append(a)
    bpy.ops.object.select_all(action="DESELECT")
    for a in anillos:
        a.select_set(True)
    bpy.context.view_layer.objects.active = anillos[0]
    bpy.ops.object.join()
    flujo = bpy.context.active_object
    flujo.name = "Campo_Magnetico"
    flujo.data.name = "Campo_Magnetico"
    flujo.data.materials.clear()
    flujo.data.materials.append(mat_campo)

    out_path = os.path.join(MODELOS_DIR, "inductor_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo Inductor Bourns SRR1260 con autopsia y flujo magnético exportado: {out_path}")


def construir_puente_h_autopsia():
    """
    Episodio 07: Toma el driver de potencia multipin L298N (TO-220-11), abre la cara
    frontal del epóxico con corte booleano y modela los 4 transistores de potencia
    en matriz H (Q1/Q4 y Q2/Q3) sobre el sustrato térmico de cobre + hilos de oro.
    """
    partes = importar_y_normalizar_kicad("l298n.glb", (0.0, 0.0))
    carcasa = next(p for p in partes if p.name.startswith("Encapsulado"))
    carcasa.name = "Carcasa_Base"
    carcasa.data.name = "Carcasa_Base"

    carcasa_tapa = carcasa.copy()
    carcasa_tapa.data = carcasa.data.copy()
    carcasa_tapa.name = "Carcasa_Corte"
    carcasa_tapa.data.name = "Carcasa_Corte"
    bpy.context.collection.objects.link(carcasa_tapa)

    # Ventana frontal sobre el bloque epóxico para dejar ver los 4 transistores internos
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -1.6, 11.0))
    cavidad = bpy.context.active_object
    cavidad.scale = (14.0, 3.8, 7.6)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    for obj_target, op in [(carcasa, "DIFFERENCE"), (carcasa_tapa, "INTERSECT")]:
        mod = obj_target.modifiers.new(name="Bool_PuenteH", type="BOOLEAN")
        mod.operation = op
        mod.solver = "FLOAT"
        mod.object = cavidad
        bpy.context.view_layer.objects.active = obj_target
        bpy.ops.object.modifier_apply(modifier=mod.name)

    bpy.data.objects.remove(cavidad, do_unlink=True)

    mat_cobre = crear_material_pbr("Sustrato_Cobre_H", (0.85, 0.48, 0.24, 1.0), metalness=0.95, roughness=0.22)
    mat_alta = crear_material_pbr("Transistor_HighSide", (1.0, 0.42, 0.12, 1.0), metalness=0.2, roughness=0.2, emissive=(0.95, 0.35, 0.05), emissive_strength=0.65)
    mat_baja = crear_material_pbr("Transistor_LowSide", (0.12, 0.85, 1.0, 1.0), metalness=0.2, roughness=0.2, emissive=(0.05, 0.65, 0.95), emissive_strength=0.65)
    mat_oro = crear_material_pbr("Hilo_Oro_H", (1.0, 0.82, 0.25, 1.0), metalness=1.0, roughness=0.15)

    # Sustrato térmico central de cobre
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.35, 11.0))
    sub = bpy.context.active_object
    sub.scale = (12.0, 0.45, 6.4)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    sub.name = "Sustrato_Termico_Cobre"
    sub.data.name = "Sustrato_Termico_Cobre"
    sub.data.materials.append(mat_cobre)

    # 4 Dies de Potencia dispuestos en Puente H (2 High-Side arriba, 2 Low-Side abajo)
    dies = [
        ("Q1_HighSide_Izq", -3.2, 12.6, mat_alta),
        ("Q3_HighSide_Der", 3.2, 12.6, mat_alta),
        ("Q4_LowSide_Izq", -3.2, 9.4, mat_baja),
        ("Q2_LowSide_Der", 3.2, 9.4, mat_baja),
    ]
    for nombre, x_d, z_d, mat in dies:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_d, -0.72, z_d))
        d = bpy.context.active_object
        d.scale = (4.0, 0.35, 2.2)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        d.name = nombre
        d.data.name = nombre
        d.data.materials.append(mat)

        # Hilo de oro hacia pines inferiores
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.09, depth=2.6, location=(x_d, -0.95, z_d - 1.3), rotation=(0.15, 0.0, 0.0))
        h = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        h.name = f"Hilo_{nombre}"
        h.data.name = f"Hilo_{nombre}"
        h.data.materials.append(mat_oro)

    out_path = os.path.join(MODELOS_DIR, "puente_h_autopsia.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format="GLB", export_apply=True)
    print(f"✔ Modelo Puente H L298N con autopsia interna 4xBJT exportado: {out_path}")


if __name__ == "__main__":
    importar_y_normalizar_kicad("to92.glb", (1.27, 0.0), "to92.glb")
    importar_y_normalizar_kicad("to220.glb", (2.54, 0.0), "to220.glb")
    importar_y_normalizar_kicad("sot23.glb", (0.0, 0.0), "sot23.glb")
    importar_y_normalizar_kicad("led5mm.glb", (1.27, 0.0), "led5mm.glb")
    importar_y_normalizar_kicad("pulsador_6mm.glb", (3.25, -2.25), "pulsador_6mm.glb")
    importar_y_normalizar_kicad("rele_spdt.glb", (0.0, -8.7), "rele_spdt.glb")
    importar_y_normalizar_kicad("rele_dpdt.glb", (11.5, -3.75), "rele_dpdt.glb")
    importar_y_normalizar_kicad("rele_smd.glb", (0.0, 0.0), "rele_smd.glb")
    importar_y_normalizar_kicad("diodo_1n4007.glb", (5.08, 0.0), "diodo_1n4007.glb")
    importar_y_normalizar_kicad("dpak.glb", (0.0, 0.0), "dpak.glb")
    importar_y_normalizar_kicad("disipador_to220.glb", (16.0, 0.0), "disipador_to220.glb")
    importar_y_normalizar_kicad("cap_electrolitico.glb", (1.75, 0.0), "cap_electrolitico.glb")
    importar_y_normalizar_kicad("cap_ceramico.glb", (0.0, 0.0), "cap_ceramico.glb")
    importar_y_normalizar_kicad("cap_tantalo.glb", (0.0, 0.0), "cap_tantalo.glb")
    importar_y_normalizar_kicad("diodo_zener.glb", (5.08, 0.0), "diodo_zener.glb")
    importar_y_normalizar_kicad("inductor_radial.glb", (2.5, 0.0), "inductor_radial.glb")
    importar_y_normalizar_kicad("inductor_smd.glb", (0.0, 0.0), "inductor_smd.glb")
    importar_y_normalizar_kicad("inductor_toroidal.glb", (0.0, 0.0), "inductor_toroidal.glb")
    importar_y_normalizar_kicad("l298n.glb", (0.0, 0.0), "l298n.glb")
    importar_y_normalizar_kicad("drv8833.glb", (0.0, 0.0), "drv8833.glb")
    agregar_bandas_resistencia()
    construir_to92_autopsia()
    construir_rele_autopsia()
    construir_mosfet_autopsia()
    construir_cap_autopsia()
    construir_diodo_autopsia()
    construir_inductor_autopsia()
    construir_puente_h_autopsia()
