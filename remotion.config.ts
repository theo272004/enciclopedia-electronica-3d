import { Config } from "@remotion/cli/config";

// Máxima calidad de salida
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCrf(16);
Config.setOverwriteOutput(true);

// WebGL acelerado por la GPU (ANGLE → Direct3D en Windows) para las escenas 3D
Config.setChromiumOpenGlRenderer("angle");
