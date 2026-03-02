"use client";

import React from "react";

export interface IDCardData {
  memberId: string;
  name: string;
  photoUrl?: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  ward: string;
  pollingUnit: string;
  state?: string;
  lga?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  chairmanTitle?: string;
  chairmanName?: string;
  secretaryTitle?: string;
  secretaryName?: string;
  footerText?: string;
  logoUrl?: string;
}

interface IDCardProps {
  data: IDCardData;
  side?: "front" | "back";
  forExport?: boolean;
}

const CARD_WIDTH = 350;
const CARD_HEIGHT = 553;

const IDCardFront = React.forwardRef<HTMLDivElement, IDCardProps>(
  ({ data }, ref) => {
    const title = data.cardTitle || "GIDAN AMANA MOVEMENT";
    const subtitle = data.cardSubtitle || "MEMBERSHIP CARD";
    const stateLabel = data.state || "KATSINA STATE, NIGERIA";
    const chairmanTitle = data.chairmanTitle || "NATIONAL CHAIRMAN";
    const secretaryTitle = data.secretaryTitle || "NATIONAL SECRETARY";
    const footerText = data.footerText || "GIDAN AMANA MOVEMENT • UNITY • PROGRESS • TRUST";

    return (
      <div
        ref={ref}
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          borderRadius: "14px",
          background: "#ffffff",
          border: "2px solid #c9a84c",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      >
        {/* ====== GREEN HEADER BANNER ====== */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d5a2d 0%, #14713a 100%)",
            padding: "18px 20px 14px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Logo placeholder */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid #c9a84c",
              margin: "0 auto 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={data.logoUrl || "/logo.png"}
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.innerHTML =
                    '<span style="color:#c9a84c;font-size:10px;font-weight:bold;text-align:center;line-height:1.2">LOGO</span>';
                }
              }}
            />
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "900",
              letterSpacing: "1.5px",
              lineHeight: "1.2",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#c9a84c",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "2.5px",
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "8px",
              letterSpacing: "2px",
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            KATSINA STATE, NIGERIA
          </div>
        </div>

        {/* ====== GOLD DIVIDER ====== */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, #c9a84c, #e8d48b, #c9a84c)" }} />

        {/* ====== BODY ====== */}
        <div style={{ padding: "16px 20px 12px" }}>
          {/* Photo + Details Row */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            {/* Photo */}
            <div
              style={{
                width: "100px",
                height: "120px",
                borderRadius: "8px",
                border: "2.5px solid #14713a",
                overflow: "hidden",
                flexShrink: 0,
                background: "#f0f7f2",
              }}
            >
              {data.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.photoUrl}
                  alt={data.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#14713a",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                >
                  {data.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              {/* Full Name */}
              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    color: "#14713a",
                    fontSize: "8px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  FULL NAME
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#1a1a1a",
                    lineHeight: "1.2",
                    textTransform: "uppercase",
                  }}
                >
                  {data.name}
                </div>
              </div>

              {/* Card No */}
              <div style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    color: "#14713a",
                    fontSize: "8px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  CARD NO.
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: "1px",
                  }}
                >
                  {data.memberId}
                </div>
              </div>

              {/* State */}
              <div style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    color: "#14713a",
                    fontSize: "8px",
                    fontWeight: "700",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  STATE
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    textTransform: "uppercase",
                  }}
                >
                  {data.state || "KATSINA"}
                </div>
              </div>
            </div>
          </div>

          {/* LGA + Ward Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginTop: "12px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#14713a",
                  fontSize: "8px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                LGA
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  textTransform: "uppercase",
                }}
              >
                {data.lga || data.pollingUnit}
              </div>
            </div>
            <div>
              <div
                style={{
                  color: "#14713a",
                  fontSize: "8px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                WARD
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  textTransform: "uppercase",
                }}
              >
                {data.ward}
              </div>
            </div>
          </div>
        </div>

        {/* ====== GOLD DIVIDER ====== */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            margin: "0 20px",
          }}
        />

        {/* ====== BOTTOM SECTION: Signatures ====== */}
        <div style={{ padding: "12px 20px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
            }}
          >
            {/* QR Code area placeholder */}
            <div
              style={{
                width: "64px",
                height: "64px",
                border: "1.5px solid #14713a",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8faf9",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gridTemplateRows: "repeat(5, 1fr)",
                  width: "40px",
                  height: "40px",
                  gap: "2px",
                }}
              >
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 22, 23, 24].includes(i)
                        ? "#14713a"
                        : "#e8f0eb",
                      borderRadius: "1px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Chairman signature */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  borderBottom: "1.5px solid #333",
                  marginBottom: "4px",
                  height: "28px",
                }}
              />
              <div
                style={{
                  color: "#14713a",
                  fontSize: "7px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {chairmanTitle}
              </div>
              {data.chairmanName && (
                <div style={{ color: "#555", fontSize: "6.5px", marginTop: "2px" }}>
                  {data.chairmanName}
                </div>
              )}
            </div>

            {/* Secretary signature */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  borderBottom: "1.5px solid #333",
                  marginBottom: "4px",
                  height: "28px",
                }}
              />
              <div
                style={{
                  color: "#14713a",
                  fontSize: "7px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {secretaryTitle}
              </div>
              {data.secretaryName && (
                <div style={{ color: "#555", fontSize: "6.5px", marginTop: "2px" }}>
                  {data.secretaryName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====== GREEN FOOTER ====== */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(180deg, #14713a 0%, #0d5a2d 100%)",
            padding: "8px 20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "7px", letterSpacing: "1px" }}>
              ISSUED: {data.issueDate}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "7px", letterSpacing: "1px" }}>
              EXPIRES: {data.expiryDate}
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "6px", letterSpacing: "0.8px", textAlign: "center", marginTop: "2px", textTransform: "uppercase" }}>
            {footerText}
          </div>
        </div>
      </div>
    );
  }
);
IDCardFront.displayName = "IDCardFront";

const IDCardBack = React.forwardRef<HTMLDivElement, IDCardProps>(
  ({ data }, ref) => {
    const title = data.cardTitle || "GIDAN AMANA MOVEMENT";
    const stateLabel = data.state || "KATSINA STATE, NIGERIA";
    const footerText = data.footerText || "GIDAN AMANA MOVEMENT • UNITY • PROGRESS • TRUST";

    return (
      <div
        ref={ref}
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          borderRadius: "14px",
          background: "#ffffff",
          border: "2px solid #c9a84c",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      >
        {/* ====== GREEN HEADER BANNER ====== */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d5a2d 0%, #14713a 100%)",
            padding: "18px 20px 14px",
            textAlign: "center",
          }}
        >
          {/* Logo placeholder */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid #c9a84c",
              margin: "0 auto 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={data.logoUrl || "/logo.png"}
              alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.innerHTML =
                    '<span style="color:#c9a84c;font-size:10px;font-weight:bold;text-align:center;line-height:1.2">LOGO</span>';
                }
              }}
            />
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "900",
              letterSpacing: "1.5px",
              lineHeight: "1.2",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#c9a84c",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "2.5px",
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            MEMBERSHIP CARD
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "8px",
              letterSpacing: "2px",
              marginTop: "4px",
              textTransform: "uppercase",
            }}
          >
            {stateLabel}
          </div>
        </div>

        {/* ====== GOLD DIVIDER ====== */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, #c9a84c, #e8d48b, #c9a84c)" }} />

        {/* ====== BODY: Authentication Advisory ====== */}
        <div style={{ padding: "24px 24px 16px" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                color: "#14713a",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              Official Authentication Advisory
            </div>
            <div
              style={{
                height: "2px",
                width: "60px",
                background: "#c9a84c",
                margin: "0 auto",
              }}
            />
          </div>

          <div
            style={{
              color: "#333",
              fontSize: "10.5px",
              lineHeight: "1.7",
              textAlign: "justify",
            }}
          >
            <p style={{ marginBottom: "10px" }}>
              This card certifies that the holder is a registered member of{" "}
              <strong>Gidan Amana Movement</strong>. This membership card remains the property
              of the movement and must be returned upon request.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Any unauthorized reproduction, alteration, or misuse of this card is strictly
              prohibited and may result in legal action.
            </p>
            <p style={{ marginBottom: "10px" }}>
              If found, please return this card to the nearest Gidan Amana Movement office
              or contact us through our official channels.
            </p>
            <p>
              The holder of this card is entitled to all rights and privileges accorded to
              registered members of the movement.
            </p>
          </div>
        </div>

        {/* ====== GOLD DIVIDER ====== */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            margin: "0 24px",
          }}
        />

        {/* ====== CARD ID SECTION ====== */}
        <div style={{ padding: "14px 24px", textAlign: "center" }}>
          <div
            style={{
              color: "#14713a",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            CARD ID
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#1a1a1a",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "2px",
            }}
          >
            {data.memberId}
          </div>
        </div>

        {/* ====== GREEN FOOTER ====== */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(180deg, #14713a 0%, #0d5a2d 100%)",
            padding: "10px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "7.5px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            {footerText}
          </div>
        </div>
      </div>
    );
  }
);
IDCardBack.displayName = "IDCardBack";

const IDCard = React.forwardRef<HTMLDivElement, IDCardProps>(
  ({ data, side = "front", forExport = false }, ref) => {
    if (side === "back") {
      return <IDCardBack ref={ref} data={data} forExport={forExport} />;
    }
    return <IDCardFront ref={ref} data={data} forExport={forExport} />;
  }
);

IDCard.displayName = "IDCard";
export default IDCard;
export { CARD_WIDTH, CARD_HEIGHT };
