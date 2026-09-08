import React from "react";

// Original SVG pixels. All artwork is drawn for this site.
export function Icon({ name = "computer", size = 20, ...props }) {
  const paths = {
    computer: (
      <>
        <path fill="#d9d8c7" d="M2 2h19v14H2zM8 17h7v2h5v2H3v-2h5z" />
        <path fill="#243b49" d="M4 4h15v10H4z" />
        <path fill="#9ad373" d="M6 6h4v2H6zm0 3h8v1H6z" />
        <path fill="#eab950" d="M18 15h2v1h-2z" />
      </>
    ),
    folder: (
      <>
        <path fill="#8a5824" d="M1 5h8l2 3h12v13H1z" />
        <path fill="#f3c366" d="M2 4h7l2 3h10v12H2z" />
        <path fill="#ffdb86" d="M3 10h20l-3 11H1z" />
      </>
    ),
    block: (
      <>
        <path fill="#775035" d="M2 7h20v14H2z" />
        <path fill="#79a253" d="M2 3h20v8h-4V8h-3v5h-4V9H7v3H2z" />
        <path fill="#a77e4b" d="M5 15h4v3H5zm10-1h3v2h-3zm3 4h4v3h-4z" />
      </>
    ),
    terminal: (
      <>
        <path fill="#a9aea5" d="M1 3h22v18H1z" />
        <path fill="#172b28" d="M3 6h18v13H3z" />
        <path
          fill="none"
          stroke="#a8d76f"
          strokeWidth="2"
          d="m6 9 3 3-3 3m6 0h5"
        />
      </>
    ),
    network: (
      <>
        <path
          stroke="#a5aaad"
          strokeWidth="2"
          fill="none"
          d="M12 6v10M4 15h16"
        />
        <path fill="#75b9c4" d="M7 1h10v8H7zM0 15h8v7H0zm16 0h8v7h-8z" />
        <path fill="#dbe8d5" d="M9 3h6v3H9zM2 17h4v2H2zm16 0h4v2h-4z" />
      </>
    ),
    note: (
      <>
        <path fill="#eae6bd" d="M4 1h12l5 5v17H4z" />
        <path fill="#c0ba94" d="M16 1v6h5z" />
        <path stroke="#767f79" d="M7 10h11M7 13h11M7 16h8" />
      </>
    ),
    disk: (
      <>
        <path fill="#465b72" d="M3 2h16l3 3v17H3z" />
        <path fill="#c8c8b9" d="M6 2h12v7H6zM6 13h13v9H6z" />
        <path fill="#536379" d="M13 3h3v5h-3z" />
        <path stroke="#929381" d="M8 16h9m-9 3h9" />
      </>
    ),
    mail: (
      <>
        <path fill="#eae4bd" d="M1 5h22v15H1z" />
        <path
          stroke="#828675"
          fill="none"
          d="m1 5 11 9L23 5M1 20l8-8m14 8-8-8"
        />
      </>
    ),
    trash: (
      <>
        <path fill="#b5c2bd" d="M5 6h15l-2 17H7zM3 3h19v3H3zM9 1h7v2H9z" />
        <path stroke="#6c7c78" d="m8 8 1 12m3-12v12m4-12-1 12" />
      </>
    ),
    play: (
      <>
        <path fill="#963e32" d="M1 4h22v17H1z" />
        <path fill="#e6d5b9" d="m9 7 9 6-9 5z" />
      </>
    ),
    shield: (
      <>
        <path fill="#5c929a" d="m12 1 10 4-2 12-8 6-8-6L2 5z" />
        <path stroke="#d8e8bf" strokeWidth="2" fill="none" d="m6 11 4 4 7-8" />
      </>
    ),
    gear: (
      <>
        <path
          fill="#d2ccad"
          d="M8 1h8v4h4v4h4v7h-4v4h-4v4H8v-4H4v-4H0V9h4V5h4z"
        />
        <path fill="#506473" d="M8 9h8v7H8z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.computer}
    </svg>
  );
}
export function PixelComputer({ small = false }) {
  return (
    <svg
      className={small ? "pixel-computer small" : "pixel-computer"}
      width="174"
      height="148"
      viewBox="0 0 116 100"
      role="img"
      aria-label="An original pixel drawing of a smiling beige computer"
      shapeRendering="crispEdges"
    >
      <path
        fill="#182e40"
        d="M16 7h67v5h5v55h-5v7H63v6h30v4h8v11H1V84h7v-4h28v-6H16v-6h-5V13h5z"
      />
      <path fill="#b7b9a3" d="M16 12h67v55H16zM41 68h17v15H41zM9 84h84v7H9z" />
      <path
        fill="#e1dfc0"
        d="M16 12h67v5H16zm0 5h6v43h-6zm6 43h61v7H22zM9 84h84v3H9z"
      />
      <path fill="#767e72" d="M24 20h52v36H24z" />
      <path fill="#163b3a" d="M28 24h44v28H28z" />
      <path
        fill="#92c775"
        d="M35 30h5v7h-5zm24 0h5v7h-5zM40 42h19v4H40zm-4-4h4v5h-4zm23 0h4v5h-4z"
      />
      <path
        fill="#7a8271"
        d="M22 62h18v2H22zM14 88h9v2h-9zm12 0h9v2h-9zm12 0h9v2h-9zm12 0h9v2h-9zm12 0h9v2h-9z"
      />
      <path fill="#e7ac44" d="M72 61h5v3h-5z" />
      <path fill="#172c3d" d="M91 35h22v51H91z" />
      <path fill="#cecfb2" d="M94 38h16v44H94z" />
      <path fill="#8b9483" d="M97 43h10v4H97zm0 9h10v2H97z" />
      <path fill="#78a75c" d="M97 74h3v3h-3z" />
      <path stroke="#a7b89e" fill="none" d="M102 87v7h10v-4" />
      <path
        fill="#f3c868"
        d="M95 9h3v4h4v3h-4v4h-3v-4h-4v-3h4zM2 31h3v3h3v3H5v3H2v-3h-3v-3h3z"
      />
    </svg>
  );
}
export function BlockLandscape() {
  return (
    <svg
      className="block-landscape"
      width="400"
      height="135"
      viewBox="0 0 400 135"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Original pixel landscape with blocky hills, a tree, and a little house"
    >
      <path fill="#a7c4bb" d="M0 0h400v135H0z" />
      <path
        fill="#dee3c6"
        d="M36 20h27v-7h31v7h25v9H36zm231 15h24v-8h32v8h35v10h-91z"
      />
      <path fill="#f6dd95" d="M350 9h19v19h-19z" />
      <path
        fill="#7c9e83"
        d="M0 82h25V66h30V57h38v20h37V63h38V50h32v15h38v19h35V62h46V48h40v18h51v69H0z"
      />
      <path
        fill="#617d58"
        d="M0 109h45V94h42V78h26V68h36v26h38v11h43V89h39V76h35v18h38v9h58v32H0z"
      />
      <path fill="#815b3c" d="M0 124h59v-10h81v7h116v-15h64v10h80v19H0z" />
      <path
        fill="#92ad58"
        d="M0 118h59v-9h81v7h116v-15h64v10h80v8h-80v-9h-64v14H140v-3H59v5H0z"
      />
      <path fill="#644933" d="M74 49h9v64h-9z" />
      <path fill="#44624b" d="M48 32h55v10h12v26H96v9H56V67H43V45h5z" />
      <path fill="#5d7b48" d="M48 32h55v10H85v8H48zm-5 18h13v17H43z" />
      <path fill="#c8ac75" d="M266 66h47v36h-47z" />
      <path
        fill="#754e39"
        d="M258 58h63v12h-63zm8-8h47v8h-47zm12-9h24v9h-24z"
      />
      <path fill="#634e3b" d="M282 79h12v23h-12z" />
      <path fill="#eacb79" d="M300 76h8v10h-8z" />
      <path fill="#d9d7ad" d="M175 106h16v11h-16z" />
      <path fill="#454e44" d="M190 108h5v6h-5zm-13 9h3v5h-3zm10 0h3v5h-3z" />
      <path
        fill="#ae8250"
        d="M12 131h12v4H12zm56-8h8v5h-8zm201-4h10v6h-10zm84 6h15v5h-15z"
      />
    </svg>
  );
}
