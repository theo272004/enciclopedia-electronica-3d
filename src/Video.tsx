import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Fondo } from "./componentes/Fondo";
import { Subtitulos } from "./componentes/Subtitulos";
import { Autopsia } from "./escenas/Autopsia";
import { Cierre } from "./escenas/Cierre";
import { Circuito } from "./escenas/Circuito";
import { Intro } from "./escenas/Intro";
import { Partes } from "./escenas/Partes";
import { Regiones } from "./escenas/Regiones";
import type { EscenaId, FormatoVideo, Idioma } from "./guion";
import { PRE, TRANS, type EscenaPlan } from "./tiempo";

export type VideoProps = { idioma: Idioma; formato?: FormatoVideo; escenas: EscenaPlan[] };
export type EscenaProps = { plan: EscenaPlan; idioma: Idioma };

const COMPONENTES: Record<EscenaId, React.FC<EscenaProps>> = {
  intro: Intro,
  autopsia: Autopsia,
  partes: Partes,
  circuito: Circuito,
  regiones: Regiones,
  cierre: Cierre,
};

export const Video: React.FC<VideoProps> = ({ idioma, escenas }) => (
  <AbsoluteFill>
    <Fondo />
    <TransitionSeries>
      {escenas.map((plan, i) => {
        const Escena = COMPONENTES[plan.id];
        return (
          <React.Fragment key={plan.id}>
            {i > 0 && (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS })} />
            )}
            <TransitionSeries.Sequence durationInFrames={plan.frames}>
              <Escena plan={plan} idioma={idioma} />
              {plan.audio && (
                <Sequence from={PRE}>
                  <Audio src={staticFile(plan.audio)} />
                </Sequence>
              )}
              <Subtitulos palabras={plan.palabras} desdeFrame={PRE} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  </AbsoluteFill>
);
