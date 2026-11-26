import { brand } from '@/lib/content';

/** Full-screen intro. Choreography comes from IX2 action list a-178 (see lib/ix2.ts). */
export default function Preloader() {
  return (
    <div id="preloader" data-w-id="3c46ffd5-4000-c744-b844-96cae5abe570" style={{ opacity: 0 }} className="preloader-wrapper">
      <div data-w-id="3487650e-4c26-54c5-2aef-2841b8075482" style={{ display: 'flex' }} className="preloader-home">
        <div data-w-id="6f33be46-cdb6-53ec-7477-70b76324366d" style={{ width: '100%', height: '100%' }} className="preloader-frame">
          <div className="reloader-container">
            <div id="startPreloader" data-w-id="aab38b23-d130-2b6d-414f-e584fdd953ad" className="preloader-button">
              Button Text
            </div>
            <div className="preloader-logo-frame">
              <div className="preloader-logo-mask">
                <div className="prelaoder-logo-wrapper">
                  {/* the original drives a Lottie logo (0→79 %) here; we drive a wordmark reveal from the same value */}
                  <div data-w-id="e03bb02e-34c0-a26d-6036-7530a5b4d258" data-animation-type="lottie" className="bl-preloader-mark">
                    <span className="bl-wordmark">{brand.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
