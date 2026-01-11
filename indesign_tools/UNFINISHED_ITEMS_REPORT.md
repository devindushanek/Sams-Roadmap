# 🚧 Thesis Finalization: Action Items & Unfinished Elements

Based on the automated analysis of `Thesis Book 2025-07-02.indd`, here is a prioritized list of items that appear unfinished or require attention.

## 🚨 1. Critical Content Issues (Text Cut Off)
*These are the most urgent issues. Text is currently hidden because the frames are too small.*

*   **Page 4:** A text frame has **371 characters** hidden (Overset).
    *   *Location:* Top of page (starts at Y: -0.28").
    *   *Action:* Resize the text frame or edit the text to fit.
*   **Page 42:** A text frame has **570 characters** hidden (Overset).
    *   *Location:* Middle of page (starts at Y: 3.38").
    *   *Action:* This is likely a significant paragraph. Resize frame or thread to a new frame.

## 🖼️ 2. Missing Assets
*   **Missing Image Link:** `GenAIImage_27980529-37fb-4085-8c79-e33292b34c39_Modified_17418939862868975.jpeg`
    *   *Status:* The link is broken. InDesign cannot find this file.
    *   *Action:* Relink this image in the Links panel.

## 📖 3. Citation & Reference Inconsistencies
*The document currently mixes two different citation styles. This is often flagged as "unfinished" in academic reviews.*

*   **Style Conflict:**
    *   **Chicago/Numeric** used in ~25 instances (e.g., `(2016)`, `(4)`).
    *   **APA** used in ~8 instances (e.g., `(Williams, 2024)`, `(Delijani, 2024)`).
*   **Action:** Choose **ONE** style and convert all citations to match.
    *   *To fix:* Search for `(` to find and standardize them.

## 📐 4. Print Specifications (Technical)
*   **Bleed is set to 0":**
    *   *Issue:* Professional printing requires a "bleed" area (usually 0.125") for images that go to the edge of the page. Without it, you may get white slivers on the edges when trimmed.
    *   *Action:* Go to `File > Document Setup` and set Bleed to `0.125 in` (Top, Bottom, Inside, Outside).

## 🧩 5. Layout Gaps (Empty Frames)
*You requested to ignore these for now, but for the record:*
*   **73 Empty Text Frames** detected (Pages 1, 7, 15, 16, 34, 48 have the most).
*   **Action:** Eventually delete these to keep the document clean, but they won't print, so they are lower priority.

---

### 🚀 Recommended Next Steps

1.  **Fix Overset Text:** Run the `fix_overset.jsx` script to try and auto-expand the frames on Page 4 and 42.
2.  **Standardize Citations:** Decide on APA vs. Chicago and manually update the outliers.
3.  **Set Bleed:** Manually update Document Setup.
4.  **Visual Polish:** Run `visual_audit.jsx` to find "micro" issues like widows (single words on a line) and orphans.
