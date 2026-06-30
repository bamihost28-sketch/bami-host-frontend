/**
 * Receipt Generation Utility - Generates PDF receipts for payments
 * Uses jsPDF for PDF generation
 */

interface ReceiptData {
  receiptNumber: string;
  date: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  apartmentNumber: string;
  estateName: string;
  amount: number;
  paymentType: 'rent' | 'service_charge' | 'utility' | 'water' | 'electricity' | 'waste' | 'generator';
  paymentMethod: string;
  reference: string;
  status: 'paid' | 'pending' | 'failed';
  month?: string;
}

/**
 * Format currency for Nigerian Naira
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate PDF receipt using canvas2pdf approach
 */
export const generateReceiptPDF = async (data: ReceiptData): Promise<void> => {
  try {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Create receipt HTML
    const receiptHTML = `
      <div style="width: 210mm; height: 297mm; padding: 20mm; font-family: Arial, sans-serif; color: #333; background: white;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #27ae60; padding-bottom: 15px;">
          <h1 style="margin: 0; color: #27ae60; font-size: 28px;">BamiHost</h1>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">Estate & Property Management</p>
          <p style="margin: 5px 0; color: #999; font-size: 12px;">www.bamihost.com | support@bamihost.com</p>
        </div>

        <!-- Receipt Title -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #333;">PAYMENT RECEIPT</h2>
          <p style="margin: 5px 0; font-size: 12px; color: #999;">Receipt #${data.receiptNumber}</p>
        </div>

        <!-- Tenant Information -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #27ae60; text-transform: uppercase;">Tenant Information</h3>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr>
              <td style="width: 30%; font-weight: bold;">Name:</td>
              <td>${data.tenantName}</td>
              <td style="width: 30%; font-weight: bold;">Email:</td>
              <td>${data.tenantEmail}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Phone:</td>
              <td>${data.tenantPhone}</td>
              <td style="font-weight: bold;">Apartment:</td>
              <td>${data.apartmentNumber}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Estate:</td>
              <td colspan="3">${data.estateName}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Details -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #27ae60; text-transform: uppercase;">Payment Details</h3>
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr>
              <td style="width: 30%; font-weight: bold;">Payment Type:</td>
              <td>${data.paymentType.replace(/_/g, ' ').toUpperCase()}</td>
              <td style="width: 30%; font-weight: bold;">Month:</td>
              <td>${data.month || formatDate(data.date)}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Payment Method:</td>
              <td>${data.paymentMethod}</td>
              <td style="font-weight: bold;">Status:</td>
              <td>
                <span style="padding: 3px 8px; border-radius: 3px; background: ${
                  data.status === 'paid' ? '#27ae60' : data.status === 'pending' ? '#f39c12' : '#e74c3c'
                }; color: white; font-size: 11px; font-weight: bold;">
                  ${data.status.toUpperCase()}
                </span>
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Transaction Ref:</td>
              <td colspan="3">${data.reference}</td>
            </tr>
            <tr>
              <td style="font-weight: bold;">Date & Time:</td>
              <td colspan="3">${formatDate(data.date)}</td>
            </tr>
          </table>
        </div>

        <!-- Amount -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
          <table style="width: 100%; font-size: 12px;">
            <tr>
              <td style="text-align: right; font-weight: bold;">Amount Paid:</td>
              <td style="text-align: right; font-size: 18px; color: #27ae60; font-weight: bold; padding-left: 20px;">
                ${formatCurrency(data.amount)}
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px solid #ecf0f1; padding-top: 15px; text-align: center; color: #999; font-size: 11px;">
          <p style="margin: 5px 0;">This is an automatically generated receipt. For any inquiries, please contact support.</p>
          <p style="margin: 5px 0;">BamiHost © ${new Date().getFullYear()} | All rights reserved</p>
        </div>
      </div>
    `;

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = receiptHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download PDF
      pdf.save(`receipt_${data.receiptNumber}.pdf`);
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw new Error('Failed to generate receipt. Please try again.');
  }
};

/**
 * Alternative: Generate receipt as image (PNG)
 */
export const generateReceiptImage = async (data: ReceiptData): Promise<void> => {
  try {
    const html2canvas = (await import('html2canvas')).default;

    // Create receipt HTML
    const receiptHTML = `
      <div style="width: 800px; padding: 40px; font-family: Arial, sans-serif; color: #333; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #27ae60; padding-bottom: 15px;">
          <h1 style="margin: 0; color: #27ae60; font-size: 32px;">BamiHost</h1>
          <p style="margin: 5px 0;">Receipt #${data.receiptNumber}</p>
        </div>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr><td><strong>Name:</strong> ${data.tenantName}</td><td><strong>Amount:</strong> ${formatCurrency(data.amount)}</td></tr>
          <tr><td><strong>Date:</strong> ${formatDate(data.date)}</td><td><strong>Status:</strong> ${data.status.toUpperCase()}</td></tr>
        </table>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = receiptHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `receipt_${data.receiptNumber}.png`;
      link.click();
    } finally {
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Error generating receipt image:', error);
    throw new Error('Failed to generate receipt. Please try again.');
  }
};
