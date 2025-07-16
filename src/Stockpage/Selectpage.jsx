import React, { useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge
} from "react-bootstrap";
import { 
  PeopleFill, 
  BoxSeamFill, 
  ArrowRight, 
  Building,
  GeoAltFill,
  Boxes,
  Clipboard2DataFill,
  Display,
  Tools,
  Archive,
  Send
} from "react-bootstrap-icons";

function Selectpage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // สไตล์ของการ์ดแบบมินิมอล
  const cardStyle = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderRadius: '10px',
    border: 'none',
    height: '100%',
    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
    background: '#2a2a2a'
  };

  // สไตล์การ์ดเมื่อ hover
  const cardHoverStyle = {
    transform: 'translateY(-8px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  };

  // ข้อมูลของแต่ละระบบ
  const systems = [
    {
      id: 'crm',
      title: 'CRM System',
      description: 'ระบบจัดการลูกค้าสัมพันธ์',
      icon: <PeopleFill size={36} />,
      color: '#00c853', // สีเขียวหลักของ ALIAN
      url: '/ERP/Home',
      features: ['จัดการข้อมูลลูกค้า', 'ติดตามการขาย', 'บริหารความสัมพันธ์']
    },
    {
      id: 'store',
      title: 'Store System',
      description: 'ระบบจัดการคลังสินค้า',
      icon: <BoxSeamFill size={36} />,
      color: '#00c853', // สีเขียวหลักของ ALIAN
      url: '/ERP/Stock',
      features: ['จัดการสต๊อก', 'ติดตามการเบิก-จ่าย', 'รายงานสินค้าคงคลัง']
    },
    {
      id: 'product',
      title: 'Product System',
      description: 'ระบบจัดการสินค้า',
      icon: <Display size={36} />,
      color: '#00c853', // สีเขียวหลักของ ALIAN
      url: '/ERP/Product',
      features: ['จัดเก็บสินค้า', 'นำออกสินค้า', 'ส่งซ่อม']
    }
  ];

  // ใช้ข้อมูลระบบที่เพิ่ม Product เข้าไป
  const allSystems = systems;

  // ฟังก์ชันสำหรับการจัดการคลิกที่การ์ด
  const handleCardClick = (url) => {
    window.location = url;
  };

  return (
    <Container fluid className="py-5" style={{ 
      backgroundColor: '#1a1a1a', // สีพื้นหลังดำนุ่มเหมือนเว็บบริษัท
      minHeight: '100vh',
      fontFamily: "'Inter', 'Prompt', sans-serif" 
    }}>
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold" style={{ 
            color: '#ffffff',
            fontSize: '2.5rem',
            letterSpacing: '-0.5px'
          }}>
            ระบบจัดการข้อมูล
          </h1>
          <p className="lead" style={{ color: '#bdbdbd', maxWidth: '600px', margin: '0 auto' }}>
            เลือกระบบที่ต้องการใช้งานเพื่อจัดการข้อมูลธุรกิจของคุณ
          </p>
        </div>

        <Row className="justify-content-center g-4">
          {allSystems.map((system) => (
            <Col key={system.id} xs={12} md={6} lg={4} className="mb-4">
              <Card
                style={{
                  ...cardStyle,
                  ...(hoveredCard === system.id ? cardHoverStyle : {})
                }}
                onMouseEnter={() => setHoveredCard(system.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(system.url)}
                className="position-relative"
              >
                <Card.Body className="p-4">
                  <div className="mb-3" style={{ color: system.color }}>
                    {system.icon}
                  </div>
                  <Card.Title as="h3" style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#ffffff'
                  }}>
                    {system.title}
                  </Card.Title>
                  <Card.Subtitle 
                    style={{ 
                      fontSize: '0.875rem',
                      color: '#bdbdbd',
                      marginBottom: '1rem'
                    }}
                  >
                    {system.description}
                  </Card.Subtitle>
                  
                  <div className="mb-4">
                    {system.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        pill 
                        className="me-2 mb-2" 
                        bg="light" 
                        text="dark"
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 'normal',
                          padding: '6px 10px',
                          backgroundColor: '#333333', // สีเทาเข้มเหมือนเว็บบริษัท
                          color: '#e0e0e0'
                        }}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div 
                    className="d-flex align-items-center mt-3" 
                    style={{ 
                      color: system.color,
                      fontWeight: '500'
                    }}
                  >
                    <small style={{ fontSize: '0.85rem' }}>เข้าสู่ระบบ</small>
                    <ArrowRight 
                      style={{ 
                        transition: 'transform 0.3s',
                        transform: hoveredCard === system.id ? 'translateX(5px)' : 'translateX(0)',
                        marginLeft: '5px'
                      }} 
                    />
                  </div>
                </Card.Body>
                
                <div 
                  className="position-absolute" 
                  style={{ 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '5px', 
                    backgroundColor: system.color,
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px'
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>
        
        <Row className="justify-content-center mt-5">
          <Col md={10} lg={8}>
            <Card 
              className="border-0 p-4"
              style={{ 
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: '#2a2a2a'
              }}
            >
              <Card.Body>
                <h4 
                  className="mb-4 text-center" 
                  style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600',
                    color: '#ffffff'
                  }}
                >
                  รายละเอียดระบบ
                </h4>
                <Row className="g-4">
                  <Col xs={12} md={6}>
                    <div className="d-flex mb-3 align-items-start">
                      <div style={{ 
                        color: '#ffffff', 
                        backgroundColor: '#00c853',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building size={20} />
                      </div>
                      <div className="ms-3">
                        <h5 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          marginBottom: '0.3rem',
                          color: '#ffffff'
                        }}>
                          CRM System
                        </h5>
                        <p style={{ 
                          fontSize: '0.875rem',
                          color: '#bdbdbd',
                          marginBottom: '0'
                        }}>
                          จัดการฐานข้อมูลลูกค้า และติดตามการทำงานกับลูกค้า
                        </p>
                      </div>
                    </div>
                    <div className="d-flex mb-3 align-items-start">
                      <div style={{ 
                        color: '#ffffff', 
                        backgroundColor: '#00c853',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Clipboard2DataFill size={20} />
                      </div>
                      <div className="ms-3">
                        <h5 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          marginBottom: '0.3rem',
                          color: '#ffffff'
                        }}>
                          ข้อมูลการขาย
                        </h5>
                        <p style={{ 
                          fontSize: '0.875rem',
                          color: '#bdbdbd',
                          marginBottom: '0'
                        }}>
                          จัดการข้อมูลการขาย และติดตามยอดขาย
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="d-flex mb-3 align-items-start">
                      <div style={{ 
                        color: '#ffffff', 
                        backgroundColor: '#00c853',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Boxes size={20} />
                      </div>
                      <div className="ms-3">
                        <h5 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          marginBottom: '0.3rem',
                          color: '#ffffff'
                        }}>
                          Store System
                        </h5>
                        <p style={{ 
                          fontSize: '0.875rem',
                          color: '#bdbdbd',
                          marginBottom: '0'
                        }}>
                          จัดการสินค้าในคลัง และติดตามการเบิก-จ่าย
                        </p>
                      </div>
                    </div>
                    <div className="d-flex mb-3 align-items-start">
                      <div style={{ 
                        color: '#ffffff', 
                        backgroundColor: '#00c853',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Display size={20} />
                      </div>
                      <div className="ms-3">
                        <h5 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          marginBottom: '0.3rem',
                          color: '#ffffff'
                        }}>
                          Product System
                        </h5>
                        <p style={{ 
                          fontSize: '0.875rem',
                          color: '#bdbdbd',
                          marginBottom: '0'
                        }}>
                          จัดเก็บสินค้า นำออกสินค้า และส่งซ่อม
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
                
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <footer className="mt-5 text-center" style={{ color: '#6c757d', fontSize: '0.875rem' }}>
          <p>© {new Date().getFullYear()} ALIAN TECHNOLOGY CO.,LTD. สงวนลิขสิทธิ์.</p>
        </footer>
      </Container>
    </Container>
  );
}

export default Selectpage;