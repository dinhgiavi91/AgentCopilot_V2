import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../client/src/components/Sprint10VideoModules.tsx", import.meta.url), "utf8");
const adminSource = readFileSync(new URL("../client/src/components/PilotAdminCMS.tsx", import.meta.url), "utf8");

describe("MarketingStudio", () => {
  it("dùng tab động, text local và xuất PNG bằng native canvas", () => {
    for (const token of [
      "export function MarketingStudio",
      "session: PilotSession | null",
      "templates?: MarketingTemplate[]",
      "const availableTabs = useMemo(() =>",
      "const [activeTab, setActiveTab] = useState(\"\")",
      "const currentTabTemplates = useMemo(() =>",
      "const [text, setText] = useState(\"\")",
      "const suggestedMessages = useMemo(() => Array.from(new Set(",
      "setText(selectedBg?.message_template || \"\")",
      "key={selectedBg?.code || \"empty\"}",
      "Gợi ý theo danh mục…",
      "selectedBg?.message_template || \"\"",
      "text.split(\"\\n\")",
      "document.createElement(\"canvas\")",
      "canvas.getContext(\"2d\")",
      "MARKETING_GRADIENTS",
      "getMarketingGradient",
      "const width = 800",
      "context.createLinearGradient",
      "context.fillText",
      "canvas.toBlob",
      "context.arcTo",
      "context.shadowBlur = 2",
      "\"Playfair Display\", Georgia, serif",
      "system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
      "AgentCopilot_${selectedBg.code}",
      "MOCK_TEMPLATES",
      "templates = []",
      "TVV của đội ngũ",
      "Không nhập tên, email, số điện thoại",
      "activeTab",
      "availableTabs.some((tab) => tab.key === current)",
      "normalizeCategory(template.category) || \"khac\"",
      "textPos",
      "sigPos",
      "Xuất Ảnh & Chia Sẻ",
      "fontSize",
      "sigName",
      "sigTitle",
      "sigIcon",
      "renderSignatureIcon",
      "Sang trọng · Playfair",
      "Chức danh nội bộ",
      "không thêm số điện thoại",
      "fontWeight: isBold ? 700 : 400",
      "fontStyle: isItalic ? \"italic\" : \"normal\"",
      "MARKETING_STUDIO_FONT_STYLES",
      "custom-font-sriracha",
      "custom-font-pacifico",
      "custom-font-dancing",
      "custom-font-playfair",
      "custom-font-montserrat",
      "font-family: 'Sriracha', cursive !important",
      "font-family: 'Pacifico', cursive !important",
      "font-family: 'Montserrat', sans-serif !important",
      "Chọn màu tùy ý",
      "Hiện đại · Montserrat",
      "Bay bổng · Dancing Script",
      "Chữ đậm",
      "Chữ nghiêng",
      "MARKETING_STUDIO_FONT_LINK_ID",
      "MARKETING_STUDIO_FONT_HREF",
      "document.createElement(\"link\")",
      "document.head.appendChild(link)",
      "await document.fonts?.ready",
      "family=Sriracha",
      "family=Pacifico",
      "Thư tay mộc mạc · Sriracha",
      "Thư tay lãng mạn · Pacifico",
      "const [selectedTemplate, setSelectedTemplate] = useState<MarketingTemplate | null>(null)",
      "setSelectedTemplate((current) =>",
      "const selectedInCurrentTab = currentTabTemplates.find((template) => template.code === current?.code)",
      "setSelectedTemplate(template)",
      "const handleSelectTemplate",
      "grid max-h-[280px] grid-cols-3 gap-3 overflow-y-auto pr-2 sm:grid-cols-4",
      "aspect-[3/4] w-full",
      "template.image_url ? <img src={template.image_url}",
      "const selectedTemplateImage = selectedTemplate?.image_url?.trim() ?? \"\"",
      "id=\"marketing-export-node\"",
      "flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden",
      "className=\"relative w-full max-w-[400px] aspect-[4/5] overflow-hidden mx-auto shadow-2xl\"",
      "src={selectedTemplateImage} crossOrigin=\"anonymous\" alt=\"Template Background\"",
      "object-cover z-0 pointer-events-none",
      "const handleExportImage = async",
      "import { toJpeg } from \"html-to-image\";",
      "const imgElement = element.querySelector(\"img\")",
      "!imgElement.src.startsWith(\"data:\")",
      "const base64Data = await new Promise<string>",
      "const img = new Image()",
      "img.crossOrigin = \"anonymous\"",
      "img.src = originalSrc + (originalSrc.includes(\"?\") ? \"&\" : \"?\") + \"cb=\" + Date.now()",
      "const canvas = document.createElement(\"canvas\")",
      "ctx.drawImage(img, 0, 0)",
      "resolve(canvas.toDataURL(\"image/jpeg\", 1.0))",
      "imgElement.src = base64Data",
      "await new Promise((resolve) => setTimeout(resolve, 150))",
      "await toJpeg(element, { cacheBust: true, pixelRatio: 2.5, quality: 1.0, backgroundColor: \"#ffffff\" })",
      "link.download = `AgentCopilot_Marketing_${Date.now()}.jpg`",
      "imgElement.src = originalSrc",
      "Chọn phôi theo bối cảnh",
      "return \"👤\"",
      "return \"⭐\"",
      "return \"❤️\"",
      "return \"🏆\"",
      "@import url('${MARKETING_STUDIO_FONT_HREF}')",
      "bg-white/5",
      "style={{ top: `${sigPos.y}%`, left: `${sigPos.x}%`, color }}",
    ]) {
      expect(source).toContain(token);
    }
    expect(source).not.toContain("backdrop-blur");
    expect(source).not.toContain("backdrop-filter");
    expect(source).not.toContain("dom-to-image-more");
    expect(source).not.toContain("html2canvas");
    expect(source).not.toContain("exportRef");
    expect(source).not.toContain("wsrv.nl");
    expect(source).not.toContain("FileReader");
    expect(source).not.toContain("readAsDataURL");
    expect(source).not.toContain("loadImageAsBase64");
    expect(source).not.toContain("base64Bg");
    expect(source).not.toContain("getBustedUrl");
    expect(source).not.toContain("imageTimestamp");
    expect(source).not.toContain("const [editedText, setEditedText]");
    expect(source).not.toContain("const displayedText =");
    expect(source).not.toContain("getExportUrl(selectedBg.image_url)");
    expect(source).not.toContain("backgroundImage: `url(\"${selectedBg.image_url}\")`");
    expect(source).not.toContain("manualSelectedBg");
    expect(source).not.toContain("setManualSelectedBg");
    expect(source).not.toContain("new window.Image()");
    expect(source).toContain('src={selectedTemplateImage} crossOrigin="anonymous"');
    expect((source.match(/crossOrigin="anonymous"/g) ?? [])).toHaveLength(1);
    expect(adminSource).not.toContain('crossOrigin="anonymous"');
  });
});
