export const generatePDF = async (content) => {
  try {
    // Call server-side PDF generation
    const response = await fetch('https://us-central1-rental-shield-a4638.cloudfunctions.net/generatePDF', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal_notice_${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('📄 PDF downloaded successfully!');
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to client-side method
    const createClientPDF = () => {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Legal Notice</title>
    <style>
        @page {
            margin: 0.5in;
            size: A4;
        }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            margin: 0;
            padding: 20px;
            font-size: 12pt;
            background: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            font-weight: bold;
            font-size: 16pt;
        }
        .date { 
            text-align: right; 
            margin-bottom: 20px; 
            font-size: 12pt;
        }
        .content { 
            text-align: justify; 
            margin-bottom: 20px; 
            white-space: pre-wrap;
            font-size: 12pt;
        }
        .signature { 
            margin-top: 50px; 
            text-align: right;
            font-size: 12pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LEGAL NOTICE</h1>
    </div>
    
    <div class="date">
        Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
    
    <div class="content">
        ${content}
    </div>
    
    <div class="signature">
        Sincerely,<br><br>
        [Tenant Name]<br>
        [Contact Number]<br>
        [Email Address]
    </div>
</body>
</html>`;

      // Create blob and download directly
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `legal_notice_${new Date().toISOString().slice(0,10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    createClientPDF();
  }
};
